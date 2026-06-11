export interface IronSessionData {
    user?: {
      _id: string;
      email: string;
      name?: string;
      companyId?: string;
      access_token?: string;
      refresh_token?: string;
      isProfileUpdated?: boolean;
      roleCode?: string;
    };
    companyId?: string;
  }