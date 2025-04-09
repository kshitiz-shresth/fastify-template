export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  companyName: string;
  companyWebsite: string;
  verificationToken?: string | null;
  resetToken?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditableUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyWebsite?: string;
}

export interface UpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export interface UserGetMe {
  id: number;
  email: string;
  avatar: string;
  issuedAt: number;
}
