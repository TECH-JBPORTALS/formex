import Container from "../container";
import { DataTable } from "../data-table";
import Header from "../header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { columns, type Student } from "./columns";

export const students: Student[] = [
  {
    id: "1",
    rollNumber: "001",
    name: "Arjun Reddy",
    email: "arjun@example.com",
    createdAt: "2026-01-10T10:30:00Z",
  },
  {
    id: "2",
    rollNumber: "002",
    name: "Sneha Sharma",
    email: "sneha@example.com",
    createdAt: "2026-01-12T12:00:00Z",
  },
  {
    id: "3",
    rollNumber: "003",
    name: "Rahul Verma",
    email: "rahul@example.com",
    createdAt: "2026-01-15T09:15:00Z",
  },
  {
    id: "4",
    rollNumber: "004",
    name: "Meghana Rao",
    email: "meghana@example.com",
    createdAt: "2026-01-18T14:45:00Z",
  },
];

export function StudentsPage() {
  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Students</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container>
        <DataTable columns={columns} data={students} />
      </Container>
    </>
  );
}
