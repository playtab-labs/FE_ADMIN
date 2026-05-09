import api from './instance';

export const getMdItems = async () => {
  const response = await api.post('/graphql', {
    query: `
      query MdItems {
        mdItems {
          items {
            id
            name
            thumbnailImageUrl
            price
            isSoldOut
          }
        }
      }
    `,
  });
  return response.data.data.mdItems.items;
};

export const updateMdOptionValue = async (id, body) => {
  const response = await api.put(`/admin/md-option-values/${id}`, body);
  return response.data;
};

export const getMdItemDetail = async (mdItemId) => {
  const response = await api.post('/graphql', {
    query: `
      query MdItemDetail($mdItemId: ID!) {
        mdItemDetail(mdItemId: $mdItemId) {
          id
          name
          thumbnailImageUrl
          detailImageUrl
          price
          isSoldOut
          productDescription
          optionGroups {
            id
            name
            displayOrder
            values {
              id
              valueName
              extraPrice
              isSoldOut
              displayOrder
            }
          }
        }
      }
    `,
    variables: { mdItemId },
  });
  return response.data.data.mdItemDetail;
};
