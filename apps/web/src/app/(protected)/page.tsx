import Link from "next/link";
import Container from "../../components/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function HomePage() {
  return (
    <Container>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-heading">
            Welcome to Formex
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a section to get started.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/faculty">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Faculty</CardTitle>
                <CardDescription>
                  View and manage faculty records.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/subjects">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Subjects</CardTitle>
                <CardDescription>
                  Browse subjects across programs.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/students">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Students</CardTitle>
                <CardDescription>Review student listings.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/p/1">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Programs</CardTitle>
                <CardDescription>
                  Open a program workspace (example program).
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </Container>
  );
}
