import { gql } from "@apollo/client";

// Get paginated categories
export const GET_CATEGORIES_PAGINATED = gql`
  query GetCategoriesPaginated(
    $page: Int!,
    $limit: Int!,
    $search: String,
    $status: String,
    $startDate: String,
    $endDate: String
  ) {
    categoriesPaginated(
      page: $page,
      limit: $limit,
      search: $search,
      status: $status,
      startDate: $startDate,
      endDate: $endDate
    ) {
      data {
        categoryId
        name
        status
        createdAt
      }
      total
    }
  }
`;
