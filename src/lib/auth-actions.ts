"use server";

import {
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import cognitoClient, { computeSecretHash, getClientId } from "@/lib/cognito";
import {
  setAuthCookies,
  getAuthCookies,
  clearAuthCookies,
  decodeJwtPayload,
} from "@/lib/auth-cookies";

export interface AuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  nextStep?: string;
  user?: {
    userId: string;
    username: string;
    email?: string;
  };
}

export async function signInAction(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: getClientId(),
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: computeSecretHash(username),
      },
    });

    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      const { IdToken, AccessToken, RefreshToken } =
        response.AuthenticationResult;

      if (IdToken && AccessToken && RefreshToken) {
        await setAuthCookies(IdToken, AccessToken, RefreshToken);
        return { success: true };
      }
    }

    if (response.ChallengeName) {
      return {
        success: false,
        errorCode: "CHALLENGE_REQUIRED",
        error: "Additional authentication step required.",
      };
    }

    return { success: false, error: "An unexpected error occurred." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "UserNotFoundException":
        case "NotAuthorizedException":
          return {
            success: false,
            errorCode: error.name,
            error: "Incorrect username or password.",
          };
        case "UserNotConfirmedException":
          return {
            success: false,
            errorCode: "UserNotConfirmedException",
            nextStep: "CONFIRM_SIGN_UP",
          };
        default:
          return { success: false, error: "An unexpected error occurred." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function signUpAction(
  username: string,
  password: string,
  email: string
): Promise<AuthResult> {
  try {
    const command = new SignUpCommand({
      ClientId: getClientId(),
      SecretHash: computeSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "preferred_username", Value: username },
      ],
    });

    const response = await cognitoClient.send(command);

    if (response.UserConfirmed) {
      return { success: true };
    }

    return { success: true, nextStep: "CONFIRM_SIGN_UP" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "UsernameExistsException":
          return {
            success: false,
            errorCode: "UsernameExistsException",
            error: "An account with this username already exists.",
          };
        case "InvalidPasswordException":
          return {
            success: false,
            errorCode: "InvalidPasswordException",
            error: "Password does not meet the requirements listed below.",
          };
        case "InvalidParameterException":
          return {
            success: false,
            errorCode: "InvalidParameterException",
            error: error.message || "Please check your input and try again.",
          };
        default:
          return { success: false, error: "An unexpected error occurred." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function confirmSignUpAction(
  username: string,
  code: string
): Promise<AuthResult> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: getClientId(),
      SecretHash: computeSecretHash(username),
      Username: username,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "CodeMismatchException":
          return {
            success: false,
            errorCode: "CodeMismatchException",
            error: "Invalid verification code. Please try again.",
          };
        case "ExpiredCodeException":
          return {
            success: false,
            errorCode: "ExpiredCodeException",
            error: "Verification code has expired. Request a new one.",
          };
        case "LimitExceededException":
          return {
            success: false,
            errorCode: "LimitExceededException",
            error: "Too many attempts. Please wait and try again.",
          };
        default:
          return { success: false, error: "An unexpected error occurred." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function resendCodeAction(
  username: string
): Promise<AuthResult> {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: getClientId(),
      SecretHash: computeSecretHash(username),
      Username: username,
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function forgotPasswordAction(
  username: string
): Promise<AuthResult> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: getClientId(),
      SecretHash: computeSecretHash(username),
      Username: username,
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "UserNotFoundException":
          // Don't reveal whether user exists
          return { success: true };
        case "LimitExceededException":
          return {
            success: false,
            errorCode: "LimitExceededException",
            error: "Too many attempts. Please wait before trying again.",
          };
        default:
          return { success: false, error: "An unexpected error occurred." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function confirmResetPasswordAction(
  username: string,
  code: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: getClientId(),
      SecretHash: computeSecretHash(username),
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "CodeMismatchException":
          return {
            success: false,
            errorCode: "CodeMismatchException",
            error: "Invalid verification code.",
          };
        case "ExpiredCodeException":
          return {
            success: false,
            errorCode: "ExpiredCodeException",
            error: "Code has expired. Please request a new one.",
          };
        case "InvalidPasswordException":
          return {
            success: false,
            errorCode: "InvalidPasswordException",
            error:
              "Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.",
          };
        case "LimitExceededException":
          return {
            success: false,
            errorCode: "LimitExceededException",
            error: "Too many attempts. Please wait.",
          };
        default:
          return { success: false, error: "An unexpected error occurred." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function signOutAction(): Promise<AuthResult> {
  try {
    const { accessToken } = await getAuthCookies();

    if (accessToken) {
      try {
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken,
        });
        await cognitoClient.send(command);
      } catch {
        // Token may be expired — clear cookies regardless
      }
    }

    await clearAuthCookies();
    return { success: true };
  } catch {
    await clearAuthCookies();
    return { success: true };
  }
}

export async function getIdTokenAction(): Promise<string | null> {
  try {
    const { idToken, refreshToken } = await getAuthCookies();

    if (!idToken) {
      return null;
    }

    const payload = decodeJwtPayload(idToken);
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);

    // Token is still valid
    if (exp > now) {
      return idToken;
    }

    // Token expired — try refresh
    if (!refreshToken) {
      await clearAuthCookies();
      return null;
    }

    const username = (payload["cognito:username"] as string) || "";

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: getClientId(),
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: computeSecretHash(username),
        },
      });

      const response = await cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const { IdToken, AccessToken } = response.AuthenticationResult;

        if (IdToken && AccessToken) {
          await setAuthCookies(IdToken, AccessToken, refreshToken);
          return IdToken;
        }
      }

      await clearAuthCookies();
      return null;
    } catch {
      await clearAuthCookies();
      return null;
    }
  } catch {
    return null;
  }
}

export async function getSessionAction(): Promise<AuthResult> {
  try {
    const { idToken, refreshToken } = await getAuthCookies();

    if (!idToken) {
      return { success: false };
    }

    const payload = decodeJwtPayload(idToken);
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);

    // Token is still valid
    if (exp > now) {
      return {
        success: true,
        user: {
          userId: payload.sub as string,
          username: (payload["cognito:username"] as string) || "",
          email: payload.email as string | undefined,
        },
      };
    }

    // Token expired — try refresh
    if (!refreshToken) {
      await clearAuthCookies();
      return { success: false };
    }

    // Extract username from expired token for SECRET_HASH
    const username = (payload["cognito:username"] as string) || "";

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: getClientId(),
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: computeSecretHash(username),
        },
      });

      const response = await cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const { IdToken, AccessToken } = response.AuthenticationResult;

        if (IdToken && AccessToken) {
          // Cognito doesn't return a new refresh token on refresh — reuse existing
          await setAuthCookies(IdToken, AccessToken, refreshToken);

          const newPayload = decodeJwtPayload(IdToken);
          return {
            success: true,
            user: {
              userId: newPayload.sub as string,
              username:
                (newPayload["cognito:username"] as string) || "",
              email: newPayload.email as string | undefined,
            },
          };
        }
      }

      await clearAuthCookies();
      return { success: false };
    } catch {
      await clearAuthCookies();
      return { success: false };
    }
  } catch {
    return { success: false };
  }
}
