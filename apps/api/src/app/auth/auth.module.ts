import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let secret = configService.get<string>('JWT_SECRET');

        // If no env var, try AWS Secrets Manager (for production)
        if (!secret) {
          const region = configService.get<string>('AWS_REGION') || 'eu-west-3';
          const secretName = 'webflow-migration/jwt-secret';

          try {
            const client = new SecretsManagerClient({ region });
            const response = await client.send(
              new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: 'AWSCURRENT',
              }),
            );

            if (response.SecretString) {
              secret = response.SecretString;
              Logger.log(
                `Successfully retrieved JWT secret from AWS Secrets Manager: ${secretName}`,
                'AuthModule',
              );
            }
          } catch (error) {
            Logger.error(
              `Failed to retrieve secret from AWS Secrets Manager: ${error.message}`,
              error.stack,
              'AuthModule',
            );
          }
        }

        return {
          secret: secret,
          signOptions: { expiresIn: '15m' }, // Short-lived tokens for security
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
