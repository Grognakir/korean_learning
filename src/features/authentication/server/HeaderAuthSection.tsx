import { AuthUserSync } from "@/features/authentication/components/AuthUserSync";
import { UserMenu } from "@/features/authentication/components/UserMenu";

import { getServerAuthUser } from "./getServerAuthUser";

export async function HeaderAuthSection() {
  const user = await getServerAuthUser();

  return (
    <>
      <AuthUserSync user={user} />
      <UserMenu user={user} />
    </>
  );
}
