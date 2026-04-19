import Container from "@/components/container";
import { GlobalFeedbackQuestions } from "@/components/feedback/global-feedback-questions";

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

        <GlobalFeedbackQuestions />
      </div>
    </Container>
  );
}
