import { getUserAccess } from "@/lib/rpc/client";
import { logger } from "@/utils/logger";
import { getAccessToken, getSession } from "@auth0/nextjs-auth0";
import { GetUserInfoResponse } from "@buf/safedep_api.bufbuild_es/safedep/services/controltower/v1/user_pb";
import { UserIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultPostAuthOnboardingPath = "/onboard";
const defaultPreAuthPath = "/auth";

export default async function Home() {
  const session = await getSession();
  const userInfo = new GetUserInfoResponse();
  const currentTenant = {
    tenant: "",
  };

  if (!session?.user) {
    redirect(defaultPreAuthPath);
  } else {
    /**
     * Check if user is alreaady onboarded on SafeDep Cloud
     * and redirect accordingly.
     */
    let path = "";
    try {
      const { accessToken } = await getAccessToken();
      const res = await getUserAccess(accessToken as string);

      if (!res?.access) {
        throw new Error("No access found");
      }

      if (res.access.length === 0) {
        throw new Error("No tenant found");
      }

      userInfo.access = res.access;
    } catch (error) {
      logger.debug("User not onboarded: ", error);
      path = defaultPostAuthOnboardingPath;
    } finally {
      if (path !== "") {
        redirect(path);
      }
    }
  }

  async function handleSetTenant(tenant: string) {
    "use server";

    logger.debug("Selected tenant: ", tenant);
    currentTenant.tenant = tenant;

    redirect("/api/tenant/redirect/" + tenant);
  }

  async function handleLogout() {
    "use server";
    redirect("/api/auth/logout");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-2 py-2">
        <UserIcon size={18} />
        <span className="text-sm">Welcome {session?.user?.email}</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select Tenant</CardTitle>
          <CardDescription>
            Select the tenant for use with the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Tenant</Label>
                <Select name="tenant" onValueChange={handleSetTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant to continue ..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {userInfo?.access.map((access) => (
                      <SelectItem
                        key={access?.tenant?.domain}
                        value={access?.tenant?.domain ?? ""}
                      >
                        {access.tenant?.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
