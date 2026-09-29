export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  DocumentDetails: { documentId: string };
  UserId: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string; otpDemo?: string };
  RegistrationSuccess: { userId: string };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Documents: { initialTag?: 'VEHICLE' | 'NORMAL' } | undefined;
  Upload: undefined;
  Notifications: undefined;
  Profile: undefined;
};
