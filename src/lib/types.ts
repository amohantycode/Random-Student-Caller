export interface Student {
  id: string;
  name: string;
  called: boolean;
  calledAt?: string;
}

export interface ClassPeriod {
  id: string;
  name: string;
  period: string;
  students: Student[];
  createdAt: string;
}
