// lib/withServerRoleAccess.ts
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

type ComponentType = React.ComponentType<any>;

interface WithRoleAccessOptions {
  roles: string[];
  redirectUrl?: string;
}

export function withServerRoleAccess(options: WithRoleAccessOptions) {
  const { roles, redirectUrl = '/' } = options;

  return function <T extends ComponentType>(WrappedComponent: T) {
    const ServerComponent = async (props: React.ComponentProps<T>) => {
      const session = await getSession();
      const namespace = process.env.AUTH0_NAMESPACE;
      const userRoles = session?.user[`${namespace}/roles`] as string[] || [];

      if (!session || !roles.some(role => userRoles.includes(role))) {
        redirect(redirectUrl);
      }

      return <WrappedComponent {...props} />;
    };

    return ServerComponent;
  };
}