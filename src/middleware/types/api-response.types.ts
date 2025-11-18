export class ApiResponse<J> {
  constructor(public data: J, public success: boolean) {}
}
