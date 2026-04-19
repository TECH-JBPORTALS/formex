import Link from "next/link";
import { Protect } from "@/components/auth/protect";
import Container from "@/components/container";
import { PrincipalDashboard } from "@/components/dashboard/principal-dashboard";
import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function HomePage() {
  return (
    <Protect
      allowedRoles={["principal"]}
      fallback={
        <>
          <Header>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Welcome</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Header>
          <Container className="py-6 md:py-8">
            <div className="mx-auto max-w-2xl space-y-3 md:space-y-4">
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Welcome to Formex
              </h1>
              <p className="text-pretty text-muted-foreground leading-relaxed">
                Choose a section to get started.
              </p>
            </div>
          </Container>
        </>
      }
    >
      <PrincipalDashboard />
    </Protect>
  );
}
