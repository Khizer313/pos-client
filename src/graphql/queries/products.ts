import { gql } from "@apollo/client";

export const GET_PRODUCTS_PAGINATED = gql`
  query GetProductsPaginated(
    $page: Int!,
    $limit: Int!,
    $search: String,
    $status: String,
    $startDate: String,
    $endDate: String
  ) {
    productsPaginated(
      page: $page,
      limit: $limit,
      search: $search,
      status: $status,
      startDate: $startDate,
      endDate: $endDate
    ) {
      data {
        productId
        name
        categoryAssigned
        price
        pieces
        status
        createdAt
      }
      total
    }
  }
`;
