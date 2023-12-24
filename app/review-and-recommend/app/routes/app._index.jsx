import { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  BlockStack,
  Link,
  IndexTable,
  Thumbnail,
  Pagination,
  Frame,
  Modal,
  DropZone,
  Button,
  Toast,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { ImageMajor } from "@shopify/polaris-icons";
import "../styles/index.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
};

export default function Index() {
  const limit = 10;
  const [reviews, setReviews] = useState([]);
  const [tableMetadata, setTableMetadata] = useState();
  const [curPage, setCurPage] = useState(1);
  const [openModalImport, setOpenModalImport] = useState(false);
  const [files, setFiles] = useState([]);
  const [toasMsg, setToastMsg] = useState("");
  const [trainLoading, setTrainLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    const getReviews = async () => {
      const response = await fetch(
        `http://localhost:9000/v1/review?page=${curPage}&limit=${limit}&sortBy=createdAt&sortType=DESC`
      );
      const newData = await response.json();
      setReviews(newData.data);
      setTableMetadata(newData.metadata);
    };
    getReviews();
  }, [curPage, importSuccess]);

  const handleExport = () => {
    try {
      window.location.href = "http://localhost:9000/v1/review/export";
    } catch (error) {
      console.log(error);
    }
  };

  const handleTrainModal = async () => {
    try {
      setTrainLoading(true);
      await fetch(`http://localhost:9001/training/collab-filter`);
      setToastMsg("Train recommend model successfully");
      alert("Train recommend model successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setTrainLoading(false);
    }
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      console.log("File", acceptedFiles);
      setFiles((files) => [...files, ...acceptedFiles]);
    },
    []
  );

  const TableRow = ({ review }) => {
    return (
      <IndexTable.Row id={review.id} position={review.id}>
        <IndexTable.Cell>
          <Text as="p">{review.email}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Link to={`/products/${review.handle}`}>{review.handle}</Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="p">{review.rating}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Thumbnail
            source={review.image_url || ImageMajor}
            alt={review.handle}
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="p">{review.comment}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(review.createdAt).toDateString()}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  };

  const ModalImport = () => {
    const handleImport = async () => {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("reviews-csv", file);
        });
        await fetch(`http://localhost:9000/v1/review/import`, {
          method: "POST",
          body: formData,
        });
        setOpenModalImport(false);
        setToastMsg("Import successfully");
        setImportSuccess((togge) => !togge);
        alert("Train recommend model successfully");
      } catch (error) {
        console.log(error);
      }
    };
    return (
      <div style={{ height: "500px" }}>
        <Frame>
          <Modal
            open={openModalImport}
            onClose={() => setOpenModalImport(false)}
            title="Import data"
            primaryAction={{
              content: "Save",
              onAction: () => handleImport(),
              loading: false,
            }}
            secondaryActions={[
              {
                content: "Cancel",
                onAction: () => setOpenModalImport(false),
              },
            ]}
          >
            <Modal.Section>
              <DropZone onDrop={handleDropZoneDrop} variableHeight>
                {files.length > 0 && (
                  <div>
                    {files.map((file, index) => (
                      <div alignment="center" key={index}>
                        <div>
                          {file.name}{" "}
                          <Text variant="bodySm" as="p">
                            {file.size} bytes
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!files.length && (
                  <DropZone.FileUpload actionHint="Accepts .csv" />
                )}
              </DropZone>
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
    );
  };

  return (
    <Page>
      <ui-title-bar title="Dashboard Customer">
        <button onClick={() => setOpenModalImport(true)}>Import CSV</button>
        <button variant="primary" onClick={handleExport}>
          Export CSV
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="primary"
            tone="critical"
            loading={trainLoading}
            onClick={handleTrainModal}
          >
            Train Recommend Modal
          </Button>
          <h3 className="text">Total: {tableMetadata?.totalItems}</h3>
        </div>
        <Layout>
          <Layout.Section>
            <IndexTable
              resourceName={{
                singular: "Reviews",
                plural: "Reviews",
              }}
              itemCount={1000}
              headings={[
                { title: "Email" },
                { title: "Handle books" },
                { title: "Ratings" },
                { title: "Image" },
                { title: "Comment" },
                { title: "Date" },
              ]}
              selectable={false}
            >
              {reviews.map((review) => (
                <TableRow key={review.id} review={review} />
              ))}
            </IndexTable>
            <Pagination
              onPrevious={() => {
                console.log("Previous");
                setCurPage(curPage - 1);
              }}
              onNext={() => {
                console.log("Next");
                setCurPage(curPage + 1);
              }}
              type="table"
              hasNext={curPage !== tableMetadata?.totalPages}
              hasPrevious={curPage !== 1}
              label={`1-${limit} of ${tableMetadata?.totalItems} reviews (Page ${curPage} / ${tableMetadata?.totalPages})`}
            />
          </Layout.Section>
        </Layout>
      </BlockStack>
      <ModalImport />
      {/* {toasMsg.length !== "" && (
        <Toast content={toasMsg} onDismiss={() => setToastMsg("")} />
      )} */}
    </Page>
  );
}
