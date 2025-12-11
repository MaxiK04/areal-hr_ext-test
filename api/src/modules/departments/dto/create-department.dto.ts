export class CreateDepartmentDto {
    organization_id: number;
    name: string;
    comment?: string;
    parent_id?: number;
}