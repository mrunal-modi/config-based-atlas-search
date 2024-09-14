'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

type ComponentType = React.ComponentType<any>;

interface WithRoleAccessOptions {
  roles: string[];
  redirectUrl?: string;
}

export function withClientRoleAccess({roles, redirectUrl = '/unauthorized'}: WithRoleAccessOptions) {

  return function <T extends ComponentType>(WrappedComponent: T) {
    const ClientComponent = (props: React.ComponentProps<T>) => {
      const { user, error, isLoading } = useUser();
      const [hasAccess, setHasAccess] = useState(false);
      const [ isMounted, setIsMounted ] = useState(false);
      const router = useRouter();
      const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE;
      
      useEffect(() => {
        if (!isLoading && user) {
          const userRoles = user[`${namespace}/roles`] as string[] || [];
          setHasAccess(roles.some(role => userRoles.includes(role)));
          setIsMounted(true);
        }else if(!isLoading && !user){
          setHasAccess(false);
          setIsMounted(true);
        }

      }, [user, isLoading, namespace]);

      useEffect(() => {
        if (isMounted && !hasAccess) {
          router.push(redirectUrl);
        }
      }, [hasAccess, isMounted]);

      if (isLoading) {
        return <div>Loading...</div>;
      }

      if (error) {
        return <div>Error: {error.message}</div>;
      }

      if (!user || !hasAccess) {
        return null;
      }

      return <WrappedComponent {...props} />;
    };

    return ClientComponent;
  };
}