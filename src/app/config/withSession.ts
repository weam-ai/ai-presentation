'use server';

import { cookies } from 'next/headers';
import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import ironOption from './ironOption';
import { IronSessionData } from '@/types/user';

export async function getSession(): Promise<IronSession<IronSessionData>> {
    const session = await getIronSession<IronSessionData>(await cookies(), ironOption as SessionOptions);
    return session;
};