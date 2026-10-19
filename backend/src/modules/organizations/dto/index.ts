export class CreateOrganizationDto {
  name: string;
  legalName?: string;
  slug: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  ownerId: string;
}

export class UpdateOrganizationDto {
  name?: string;
  legalName?: string;
  slug?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
}
