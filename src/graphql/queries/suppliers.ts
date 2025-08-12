import { gql } from "@apollo/client";

export const GET_SUPPLIERS_PAGINATED = gql`
  query GetSuppliersPaginated(
    $page: Int!,
    $limit: Int!,
    $search: String,
    $status: String,
    $startDate: String,
    $endDate: String
  ) {
    suppliersPaginated(
      page: $page,
      limit: $limit,
      search: $search,
      status: $status,
      startDate: $startDate,
      endDate: $endDate
    ) {
      data {
        supplierId
        name
        phone
        balance
        status
        createdAt
      }
      total
    }
  }
`;
