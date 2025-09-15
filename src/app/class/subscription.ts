export class Subscription {
  id!: number;         // 1,2,3,4
  name!: string;       // BASIC, STANDARD, PRO, ULTIMATE
  maxEvents!: number;  // 20, 50, 200, -1 for unlimited
  startDate!: Date;    // when user subscribed
  endDate!: Date;      // when it expires
  price!: number;
}
 