export class TableEntity {
  table_number: number;
  chair_count: number;

  constructor(
    table_number: number,
    chair_count: number
  ) {
    this.table_number = table_number;
    this.chair_count = chair_count;
  }
}