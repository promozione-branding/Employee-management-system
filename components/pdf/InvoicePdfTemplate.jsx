"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "LiberationSans",
  fonts: [
    {
      src: "/font/LiberationSans-Regular.ttf",
    },
    {
      src: "/font/LiberationSans-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const Invoice = ({ data }) => {
  if (!data) {
    return null;
  }

  const {
    invoiceNo,
    invoiceDate,
    GSTIN,
    clientAddress,
    clientCompany,
    clientName,
    services = [],
    taxType,
    totalAmount,
  } = data;

  // -----------------------------
  // DATE FORMAT
  // -----------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return new Date(dateString)
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
  };

  // -----------------------------
  // CURRENCY FORMAT
  // -----------------------------
  const formatIndianCurrency = (num) => {
    const number = Number(num || 0);

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // -----------------------------
  // TAX CALCULATIONS
  // -----------------------------
  const subtotal = services.reduce(
    (sum, service) => sum + Number(service?.price || 0),
    0
  );

  const taxableAmount = subtotal;

  const cgstAmount = taxableAmount * 0.09;
  const sgstAmount = taxableAmount * 0.09;
  const igstAmount = taxableAmount * 0.18;

  const taxAmount =
    taxType === "IGST"
      ? igstAmount
      : cgstAmount + sgstAmount;

  // IMPORTANT:
  // totalAmount coming from API is already tax-inclusive.
  // Example:
  // subtotal = 10000
  // tax = 1800
  // totalAmount = 11800
  const finalTotalAmount = Number(totalAmount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* =========================
            ORIGINAL INVOICE
        ========================== */}
        <View style={styles.originalInvoice}>
          <Text>(Original Invoice)</Text>
        </View>

        {/* =========================
            HEADER
        ========================== */}
        <View style={styles.header}>
          <Image src="/pdf/logo.png" style={styles.logo} />

          <Text style={styles.title}>TAX INVOICE</Text>
        </View>

        {/* =========================
            WATERMARK
        ========================== */}
        <Image src="/pdf/logo.png" style={styles.watermark} />

        {/* =========================
            INVOICE INFO
        ========================== */}
        <View style={styles.invoiceInfo}>
          <Text>
            Invoice No.: {invoiceNo || "-"}
          </Text>

          <Text>
            Invoice Date: {formatDate(invoiceDate)}
          </Text>
        </View>

        {/* =========================
            CUSTOMER DETAILS
        ========================== */}
        <View style={styles.customerDetails}>
          <Text style={styles.sectionTitle}>
            Customer Details
          </Text>

          <Text>
            <Text style={styles.bold}>Client Name: </Text>
            {clientName || "-"}
          </Text>

          <Text>
            <Text style={styles.bold}>Company Name: </Text>
            {clientCompany || "-"}
          </Text>

          <Text>
            <Text style={styles.bold}>GST No.: </Text>
            {GSTIN || "-"}
          </Text>

          <Text>
            <Text style={styles.bold}>Address: </Text>
            {clientAddress || "-"}
          </Text>
        </View>

        {/* =========================
            TABLE
        ========================== */}
        <View style={styles.table}>
          {/* TABLE HEADER */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 0.5,
                  fontWeight: "bold",
                },
              ]}
            >
              S.No.
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 3,
                  fontWeight: "bold",
                },
              ]}
            >
              Description
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontWeight: "bold",
                },
              ]}
            >
              HSN
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "right",
                },
              ]}
            >
              Rate
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontWeight: "bold",
                  textAlign: "right",
                },
              ]}
            >
              Amount (Rs.)
            </Text>
          </View>

          {/* =========================
              SERVICE ROWS
          ========================== */}
          {services.map(
            ({ serviceName, HSN, price, _id }, idx) => {
              return (
                <View
                  style={styles.tableRow}
                  key={_id || `${serviceName}-${idx}`}
                >
                  {/* S.NO */}
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 0.5,
                      },
                    ]}
                  >
                    {idx + 1}
                  </Text>

                  {/* DESCRIPTION */}
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 3,
                        fontFamily: "LiberationSans",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {serviceName || "-"}
                  </Text>

                  {/* HSN */}
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        textAlign: "right",
                      },
                    ]}
                  >
                    {HSN || "-"}
                  </Text>

                  {/* RATE */}
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        textAlign: "right",
                      },
                    ]}
                  >
                    {formatIndianCurrency(price)}
                  </Text>

                  {/* AMOUNT */}
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        textAlign: "right",
                      },
                    ]}
                  >
                    {formatIndianCurrency(price)}
                  </Text>
                </View>
              );
            }
          )}

          {/* =========================
              TAXABLE AMOUNT
          ========================== */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 0.5,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 3,
                  textAlign: "right",
                  fontSize: 8,
                },
              ]}
            >
              Taxable Amount
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontSize: 8,
                  textAlign: "right",
                },
              ]}
            >
              -
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontSize: 8,
                  textAlign: "right",
                },
              ]}
            >
              {formatIndianCurrency(taxableAmount)}
            </Text>
          </View>

          {/* =========================
              CGST
          ========================== */}
          {taxType === "SGST/CGST" && (
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 0.5,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 3,
                    textAlign: "right",
                    fontSize: 8,
                  },
                ]}
              >
                CGST
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                9%
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                {formatIndianCurrency(cgstAmount)}
              </Text>
            </View>
          )}

          {/* =========================
              SGST
          ========================== */}
          {taxType === "SGST/CGST" && (
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 0.5,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 3,
                    textAlign: "right",
                    fontSize: 8,
                  },
                ]}
              >
                SGST
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                9%
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                {formatIndianCurrency(sgstAmount)}
              </Text>
            </View>
          )}

          {/* =========================
              IGST
          ========================== */}
          {taxType === "IGST" && (
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 0.5,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 3,
                    textAlign: "right",
                    fontSize: 8,
                  },
                ]}
              >
                IGST
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                  },
                ]}
              />

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                18%
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    fontSize: 8,
                    textAlign: "right",
                  },
                ]}
              >
                {formatIndianCurrency(igstAmount)}
              </Text>
            </View>
          )}

          {/* =========================
              TOTAL TAX
          ========================== */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 0.5,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 3,
                  textAlign: "right",
                  fontSize: 8,
                },
              ]}
            >
              Total Tax Amount
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontSize: 8,
                  textAlign: "right",
                },
              ]}
            >
              18%
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontSize: 8,
                  textAlign: "right",
                },
              ]}
            >
              {formatIndianCurrency(taxAmount)}
            </Text>
          </View>

          {/* =========================
              TOTAL AMOUNT
          ========================== */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 0.5,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  textAlign: "right",
                  fontWeight: "bold",
                  flex: 3,
                },
              ]}
            >
              Total Amount
            </Text>

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                },
              ]}
            />

            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontSize: 8,
                  textAlign: "right",
                  fontWeight: "bold",
                },
              ]}
            >
              {formatIndianCurrency(finalTotalAmount)}
            </Text>
          </View>
        </View>

        {/* =========================
            NOTE SECTION
        ========================== */}
        <View
          style={[
            styles.noteSection,
            {
              fontSize: 9,
            },
          ]}
        >
          <Text>
            Whether the tax is payable on reverse charge basis: No
          </Text>

          <Text
            style={{
              marginTop: 10,
              marginBottom: 5,
              fontWeight: "bold",
            }}
          >
            NOTE:
          </Text>

          <Text>
            • Tenure of service and payment terms for this invoice would be
            governed as per the agreement between the Customer and
          </Text>

          <Text
            style={{
              marginLeft: 6,
            }}
          >
            Inquiry Bazaar Private Limited.
          </Text>

          <Text>
            • This invoice is valid, subject to realization of due payments,
            as mentioned in details above.
          </Text>

          <Text>
            • Any payment made is covered under "Advertising Contract" u/s
            194C. TDS, if applicable, shall be @ 2%.
          </Text>

          <Text>
            • You are requested to validate this invoice along with GSTIN
            within one month of Invoice date.
          </Text>

          {/* =========================
              COMPANY DETAILS
          ========================== */}
          <View style={styles.companyDetails}>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              Inquiry Bazaar Pvt Ltd.
            </Text>

            <Text>
              Regd. Office: 606 Best Business Park, Netaji Subhash Place,
              Delhi, 110034,
            </Text>

            <Text>
              Ph no: +91 - 011 42603232
            </Text>

            <Text>
              PAN No.: AAOCP9163C, GSTIN No.: 07AAOCP9163C1Z5, CIN:
              U63112DL2024PTC434224
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Invoice;

// ======================================
// STYLES
// ======================================

const styles = StyleSheet.create({
  page: {
    fontFamily: "LiberationSans",
    padding: "0px 50px",
    fontSize: 10,
  },

  originalInvoice: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 9,
    color: "#000",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  logo: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 20,
  },

  title: {
    top: 20,
    left: "50%",
    transform: "translateX(-150%)",
    fontSize: 12,
    fontWeight: "bold",
    color: "red",
  },

  invoiceInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  watermark: {
    position: "absolute",
    top: "15%",
    width: 450,
    left: "12%",
    height: 450,
    opacity: 0.08,
    objectFit: "contain",
  },

  customerDetails: {
    marginBottom: 10,
    marginTop: 10,
    lineHeight: 0.7,
  },

  bold: {
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },

  table: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  tableHeader: {
    backgroundColor: "#f0f0f0",
  },

  tableCell: {
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#000",
  },

  noteSection: {
    marginTop: 24,
    lineHeight: 1.2,
    fontFamily: "LiberationSans",
  },

  companyDetails: {
    marginTop: 5,
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 4,
  },
});