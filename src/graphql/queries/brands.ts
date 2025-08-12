import { gql } from '@apollo/client';

export const GET_BRANDS_PAGINATED = gql`
  query GetBrandsPaginated(
    $page: Int!,
    $limit: Int!,
    $search: String,
    $status: String,
    $startDate: String,
    $endDate: String
  ) {
    brandsPaginated(
      page: $page,
      limit: $limit,
      search: $search,
      status: $status,
      startDate: $startDate,
      endDate: $endDate
    ) {
      data {
        brandId
        name
        status
        createdAt
      }
      total
    }
  }
`;
