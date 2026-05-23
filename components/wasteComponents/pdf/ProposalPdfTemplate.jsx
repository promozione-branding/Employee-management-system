"use client";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { ToWords } from "to-words";

const ProposalPdfTemplate = ({ data }) => {
  if (!data) {
    return null;
  }

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
    },
  });

  // Format the date for display
  const proposalDate = new Date(data.dateOfProposal).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const formatIndianCurrency = (num) => {
    if (typeof num !== "number") return num;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------------gst amount calculation ----------------------------

  let totalAfterServiceDiscounts = data.services.reduce((total, service) => {
    let servicePrice = service.amount;
    if (service.discountAmount) {
      servicePrice -= service.discountAmount;
    } else if (service.discountPercentage) {
      servicePrice -= (service.amount * service.discountPercentage) / 100;
    }

    return total + servicePrice;
  }, 0);

  let tdcAmount = totalAfterServiceDiscounts * 0.02;
  let totalGST = totalAfterServiceDiscounts * 0.18;

  let totalAmount =
    totalAfterServiceDiscounts + totalAfterServiceDiscounts * 0.18;
  if (data?.tanNo) {
    totalAmount = totalAmount - tdcAmount;
  }

  if (data.discount > 0) {
    totalAfterServiceDiscounts = totalAfterServiceDiscounts - data.discount;
  } else if (data?.discountPercentage > 0) {
    totalAfterServiceDiscounts =
      (totalAfterServiceDiscounts * data?.discountPercentage) / 100;
  }

  totalAfterServiceDiscounts = totalAfterServiceDiscounts * 0.18;

  // ---------------------total amount calculation ----------------------------
  let totalAmountWithGST = data.totalAmount;

  if (data?.discount > 0) {
    totalAmountWithGST = totalAmountWithGST - data.discount;
  } else if (data?.discountPercentage > 0) {
    totalAmountWithGST = (totalAmountWithGST * data?.discountPercentage) / 100;
  }
  let TDSAmount = totalAmountWithGST;
  totalAmountWithGST = totalAmountWithGST * 0.18 + totalAmountWithGST;

  // ---------------------TDS amount calculation ----------------------------
  TDSAmount = TDSAmount * 0.02;

  // --------------------- calculation total discount ----------------------------
  const totalServiceDiscount = data.services.reduce((total, service) => {
    if (service.discountAmount) {
      return total + service.discountAmount;
    } else if (service.discountPercentage && service.amount) {
      return total + (service.amount * service.discountPercentage) / 100;
    }
    return total;
  }, 0);

  // --------------------- Discount show or not ----------------------------
  const discountShow = data.services.some(
    (service) =>
      (service.discountAmount !== null && service.discountAmount > 0) ||
      (service.discountPercentage !== null && service.discountPercentage > 0)
  );

  // total Amount in words
  const totalAmountInWords = toWords.convert(totalAmount);

  return (
    <Document style={{ marginTop: "0" }}>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        {/* watermark */}
        <Image src={"/blog/logo2.png"} style={styles.watermark} />

        {/* header */}
        <View style={styles.headerContainer}>
          <View style={styles.leftHeader}>
            <Image style={styles.logo} src={"/blog/Logo-Company (2).png"} />
          </View>

          <Text style={styles.proposalTitle}>PROPOSAL</Text>

          <View style={styles.rightHeader}>
            <Text style={styles.companyTitle}>Inquiry Bazaar Pvt Ltd</Text>
            <Text>Best Business Park, NSP, Delhi</Text>
            <Text>Call us : 011 42603232</Text>
            <Text>Email: info@inquirybazaar.com</Text>
            <Text>Website: www.inquirybazaar.com</Text>
          </View>
        </View>

        {/* client details */}
        <View style={styles.clientBox}>
          <Text>To,</Text>
          <Text>Client Name: {data.clientName}</Text>
          <Text>Company name: {data.clientCompany}</Text>
          <Text>Address: {data.clientAddress}</Text>
          <Text>GST No.: {data.GSTIN}</Text>
          <Text>Date: {proposalDate}</Text>
        </View>

        {/* table header */}
        <View style={styles.tableRowHeader}>
          <Text style={styles.colSN}>S.No.</Text>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colNew}>Tenure</Text>
          <Text style={styles.colNew}>{discountShow && "Discount"}</Text>
          <Text style={styles.colAmt}>Amount (INR)</Text>
        </View>

        {/* Dynamically render services */}
        {data.services &&
          data.services.map((service, index) => (
            <View style={styles.tableRow} key={service._id || index}>
              <Text style={styles.colSN}>{index + 1}.</Text>
              <View style={styles.colDesc}>
                <Text style={styles.serviceTitle}>{service.serviceTitle}</Text>
                {service.description.split(",").map((item, idx) => (
                  <Text key={idx} style={styles.serviceName}>
                    • {item}
                  </Text>
                ))}
              </View>
              <Text style={styles.colNew}>{service.duration}</Text>
              <Text style={styles.colNew}>
                {service.discountAmount
                  ? formatIndianCurrency(service.discountAmount)
                  : service.discountPercentage && service.amount
                    ? formatIndianCurrency(
                      (service.amount * service.discountPercentage) / 100
                    )
                    : ""}
              </Text>

              <View style={styles.colAmt}>
                <Text
                  style={{
                    width: "30%",
                    marginLeft: "30",
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "line-through",
                  }}
                >
                  {formatIndianCurrency(service.amount)}
                </Text>
                <Text style={styles.colAmt}>
                  {service?.discountAmount
                    ? formatIndianCurrency(
                      service?.amount - service?.discountAmount
                    )
                    : formatIndianCurrency(
                      service?.amount -
                      (service.amount * service.discountPercentage) / 100
                    )}
                </Text>
              </View>
            </View>
          ))}
        {discountShow && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Discount</Text>
            <Text style={styles.totalValue}>{/* 0000.00 */}</Text>
            <Text style={styles.totalValue}>
              {formatIndianCurrency(totalServiceDiscount)}
            </Text>
          </View>
        )}

        {/* Tax deducted from sources  */}
        {data?.tanNo && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TDS Amount (2%)</Text>
            <Text style={styles.totalValue}>{/* 0000.00 */}</Text>
            <Text style={styles.totalValue}>
              {formatIndianCurrency(tdcAmount)}
            </Text>
          </View>
        )}

        {/* <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Deal Amount (Inc. GST)</Text> */}
        {/* <Text style={styles.totalValue}>0000.00</Text> */}
        {/* <Text style={styles.totalValue}>
            {formatIndianCurrency(data.totalAmount)}
          </Text>
        </View> */}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>GST @ 18%</Text>
          <Text style={styles.totalValue}></Text>
          <Text style={styles.totalValue}>
            {formatIndianCurrency(totalGST)}
          </Text>
        </View>

        <View style={styles.totalBox}>
          <Text
            style={[styles.totalLabel, { fontWeight: "bold", fontSize: 10 }]}
          >
            Total Payable Amount
          </Text>
          <Text
            style={[styles.totalValue, { fontWeight: "bold", fontSize: 10 }]}
          >
            {/* 0000.00 */}
          </Text>

          <Text
            style={[styles.totalValue, { fontWeight: "bold", fontSize: 10 }]}
          >
            {formatIndianCurrency(totalAmount)}
          </Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={[styles.totalLabelInWords]}>In Words</Text>
          <Text style={[styles.totalValueInWords]}>{totalAmountInWords}</Text>
        </View>

        {data?.partlyPayment?.length &&
          data?.partlyPayment.map(({ _id, paymentAmount, paymentDuration }) => (
            <View style={styles.totalBox} key={_id}>
              <Text style={styles.totalLabel}></Text>
              <Text style={styles.totalValue}>{paymentDuration}</Text>

              <Text style={styles.totalValue}>
                {formatIndianCurrency(paymentAmount)}
              </Text>
            </View>
          ))}

        {/* terms */}
        <View style={styles.termsBox}>
          <Text>
            • This is an application for Inquiry Bazaar Private Limited
            services. An order confirmation may be done on phone/email before
            booking the order
          </Text>

          <Text>
            • Please check all the details given in the proposal before
            approving, there would not be any changes post deal confirmation.
          </Text>

          <Text>
            • All online content including text & pictures are to be provided by
            the client who should be the legal copyright owner of the same.
            Inquiry Bazaar shall not be liable for any claims/damages
            arising out of content posted on your catalog
          </Text>

          <Text>
            • Charges for subsequent years shall be as per the rate at that
            time, which may be higher than the current charges.
          </Text>
          <Text>
            • Work on services shall commence only after clearance of cheque/pay
            order.
          </Text>

          <Text>
            • Pursuant to the approval of this proposal, The Customer hereby
            allows Inquiry Bazaar Private Limited to make commercial calls
            on its registered mobile number(s) and organization's contact
            number(s
          </Text>

          <Text>
            • This declaration will hold valid even if the customer chooses to
            get its numbers registered for NDNC at any future date.
          </Text>
          <Text>
            • All services are offered without any performance guarantee in
            terms of number of enquiries, confirmed orders etc.
          </Text>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={[styles.page, { height: "1000px" }]}>
        <Image src={"/blog/logo2.png"} style={styles.watermark} />

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.leftHeader2}>
            <Image
              style={styles.logoSmall}
              src={"/blog/Logo-Company (2).png"}
            />
          </View>

          <View style={styles.rightHeader2}>
            <Text style={styles.companyTitle}>Inquiry Bazaar Pvt Ltd</Text>
            <Text>Best Business Park, NSP, Delhi</Text>
            <Text>Call us : 011 42603232</Text>
            <Text>Email: info@inquirybazaar.com</Text>
            <Text>Website: www.inquirybazaar.com</Text>
          </View>
        </View>

        {/* BANK DETAILS */}
        <View style={styles.bankBox}>
          <Text>Note</Text>
          <Text>
            Cheque/Draft to be made in favor INQUIRY BAZAAR PRIVATE LIMITED
          </Text>
          <Text>PAN No.: AAMCP6194C, CIN: U92112DL2024PTC432424</Text>
          <Text>BANK ACCOUNT NO : 777705997170 BANK NAME : ICICI BANK</Text>
          <Text>IFSC CODE : ICIC0000254</Text>
        </View>

        <View
          style={{
            textAlign: "left",
            color: "red",
            fontSize: 8,
            marginTop: 4,
          }}
        >
          <Text style={{ marginTop: 8 }}>
            Regd. Office: 606 Best Business Park, Netaji Subhash Place, Delhi, 110034,
            India
          </Text>
          <Text>CIN: U92112DL2024PTC432424</Text>
          <Text>011 42603232 • info@inquirybazaar.com</Text>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionMainTitle}>
          Service Offerings and Deliverables
        </Text>

        {/* WEBSITE */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Website</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Corporate Website</Text>
              <Text style={styles.deliverableContent}>
                • Website Maintenance
              </Text>
              <Text style={styles.deliverableContent}>
                • Website Enrichment in 72 hr
              </Text>
              <Text style={styles.deliverableContent}>• Free Domain</Text>
              <Text style={styles.deliverableContent}>
                • Trust Elite Certificate
              </Text>
              <Text style={styles.deliverableContent}>• Blog Building</Text>
              <Text style={styles.deliverableContent}>
                • Free SSL certificate
              </Text>
              <Text style={styles.deliverableContent}>• 1 year Hosting</Text>
              <Text style={styles.deliverableContent}>
                • Mobile Friendly Website
              </Text>
            </View>
          </View>
        </View>

        {/* SOCIAL MEDIA MANAGEMENT */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Social Media Management</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • 2 weekly Posts + Festive Posts
              </Text>
              <Text style={styles.deliverableContent}>
                • Facebook Account Management
              </Text>
              <Text style={styles.deliverableContent}>
                • Facebook Page Management
              </Text>
              <Text style={styles.deliverableContent}>
                • Instagram Account Management
              </Text>
              <Text style={styles.deliverableContent}>
                • Youtube Account Management
              </Text>
            </View>
          </View>
        </View>

        {/* design */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Designing</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Logo Design</Text>
              <Text style={styles.deliverableContent}>
                • AI Graphic Designs
              </Text>
              <Text style={styles.deliverableContent}>• Content Creation</Text>
              <Text style={styles.deliverableContent}>
                • Product Visualization
              </Text>
              <Text style={styles.deliverableContent}>
                • Search Engine Friendly
              </Text>
              <Text style={styles.deliverableContent}>• Customized layout</Text>
            </View>
          </View>
        </View>

        {/* SEO */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Search Engine Optimization</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Google Analytics</Text>
              <Text style={styles.deliverableContent}>• Meta Integration</Text>
              <Text style={styles.deliverableContent}>
                • Google Search Console
              </Text>
              <Text style={styles.deliverableContent}>
                • On page & Off page SEO
              </Text>
              <Text style={styles.deliverableContent}>
                • Backlinks Creation
              </Text>
              <Text style={styles.deliverableContent}>• Website Ranking</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* page 3 */}

      <Page size="A4" style={[styles.page, { height: "1000px" }]}>
        <Image src={"/blog/logo2.png"} style={styles.watermark} />

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.leftHeader2}>
            <Image
              style={styles.logoSmall}
              src={"/blog/Logo-Company (2).png"}
            />
          </View>

          <View style={styles.rightHeader2}>
            <Text style={styles.companyTitle}>Inquiry Bazaar Pvt Ltd</Text>
            <Text>Best Business Park, NSP, Delhi</Text>
            <Text>Call us : 011 42603232</Text>
            <Text>Email: info@inquirybazaar.com</Text>
            <Text>Website: www.inquirybazaar.com</Text>
          </View>
        </View>

        {/* TERMS HEADING */}
        <View style={styles.termsHeaderBox}>
          <Text style={styles.termsHeader}>Terms & Conditions</Text>
        </View>

        {/* TERMS LIST */}
        <View style={styles.termsList}>
          <Text style={styles.termItem}>
            1) Inquiry Bazaar Private Limited excludes any warranty,
            express or implied, as to the quality, accuracy, timeliness,
            completeness, performance, fitness, for a particular purpose of any
            of its contents, hosted on any of Inquiry Bazaar Private
            Limited servers, unless otherwise specified in writing.
          </Text>

          <Text style={styles.termItem}>
            2) Inquiry Bazaar Private Limited will not be liable for any
            damages (including, without limitation, damages for loss of business
            projects, or loss of profits) arising in contract, tort or otherwise
            from the use of or inability to use any site or any of its contents.
          </Text>

          <Text style={styles.termItem}>
            3) You indemnify Inquiry Bazaar Private Limited of all claims,
            conflicts or legal proceedings arising out of all information, data,
            text, software, music, sound, photographs, graphics, videos,
            messages or any other material ("content") posted on the website or
            privately transmitted.
          </Text>

          <Text style={styles.termItem}>
            4) You are responsible for ensuring that material on your site
            complies with National and International Laws.
          </Text>

          <Text style={styles.termItem}>
            5) Inquiry Bazaar Private Limited reserves the right to add or
            change these terms & conditions as and when required without giving
            any notice. Changes will be deemed accepted if you continue to use
            the services.
          </Text>

          <Text style={styles.termItem}>
            6) Corporate Profile prepared by third-party agencies will be a
            compilation of information of your organization. Inquiry Bazaar
            Private Limited will be authorized to use this information for
            promotional purposes.
          </Text>

          <Text style={styles.termItem}>
            7) Refund of any amount is at the sole discretion of the company.
          </Text>

          <Text style={styles.termItem}>
            8) Inquiry Bazaar Private Limited may have an option to convert
            your service to an annual service plan. If unable to pay the
            outstanding amount, you may need to discontinue the service plan.
          </Text>

          <Text style={styles.termItem}>
            9) Inquiry Bazaar Private Limited reserves the right to
            add/modify/discontinue features offered with a service.
          </Text>

          <Text style={styles.termItem}>
            10) To ensure excellent customer service, your calls may be
            monitored or recorded.
          </Text>

          <Text style={styles.termItem}>
            11) Any discounts offered are subject to continuation of service for
            the subscribed period. Early discontinuation will lead to charges as
            per applicable rates.
          </Text>

          <Text style={styles.termItem}>
            12) By accepting this document, you agree to these terms and to the
            Terms & Conditions of Use located at:
            https://www.inquirybazaar.com/terms-conditions
          </Text>
        </View>
      </Page>
    </Document>
    // </Document>
  );
};

export default ProposalPdfTemplate;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  page: {
    // marginTop: 0,
    // padding: "0 20px",
    // fontSize: 10,
    // fontFamily: "Helvetica",
    // lineHeight: 1.5,
    // position: "relative",

    padding: "0px 40px",
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    position: "relative",
  },

  watermark: {
    position: "absolute",
    top: "30%",
    width: 450,
    left: "12%",
    height: 450,
    opacity: 0.08,
    objectFit: "contain",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 12,
  },

  /* FIRST PAGE HEADER */
  leftHeader: {
    width: 130,
    justifyContent: "flex-start",
  },

  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
    borderRadius: 20,
    left: -10,
  },

  rightHeader: {
    width: "55%",
    textAlign: "right",
  },

  companyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },

  proposalTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 120,
    marginLeft: 100,
    color: "#222",
    marginBottom: 10,
  },

  clientBox: {
    backgroundColor: "#f8f8f8",
    padding: 7,
    borderRadius: 4,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderColor: "#7E9AA2",
  },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#efefef",
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },

  colNew: {
    width: "35%",
    textAlign: "center",
    fontWeight: "bold",
  },

  colSN: {
    width: "10%",
    paddingLeft: 5,
    fontWeight: "bold",
  },

  colDesc: {
    width: "45%",
    paddingLeft: 5,
    fontWeight: "bold",
  },

  colAmt: {
    width: "30%",
    marginLeft: "30",
    textAlign: "center",
    fontWeight: "bold",
  },

  colAmtNew: {
    width: "30%",
    marginLeft: "30",
    textAlign: "center",
    fontWeight: "bold",
  },

  serviceTitle: {
    fontWeight: "bold",
  },

  serviceName: {
    fontSize: 8,
    fontWeight: "bold",
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderColor: "#dcdcdc",
    marginTop: 2,
  },

  totalLabel: {
    fontWeight: "normal",
    fontSize: 8,
  },

  totalValue: {
    width: "20%",
    textAlign: "right",
    fontWeight: "normal",
    fontSize: 8,
  },

  totalLabelInWords: {
    fontWeight: "bold",
    fontSize: 10,
    width: "40%",
    textAlign: "left",
  },

  totalValueInWords: {
    width: "60%",
    textAlign: "right",
    // fontStyle: "",
    fontSize: 8,
  },

  termsBox: {
    marginTop: 14,
    fontSize: 8,
    lineHeight: 1.5,
  },

  /* ---------------- PAGE 2 ---------------- */

  leftHeader2: {
    width: 130,
    justifyContent: "flex-start",
  },

  logoSmall: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    objectFit: "cover",
  },

  rightHeader2: {
    width: "55%",
    textAlign: "right",
  },

  bankBox: {
    backgroundColor: "#F8F8F8",
    padding: 4,
    fontSize: 8,
    borderLeftWidth: 3,
    borderColor: "#7E9AA2",
  },

  sectionMainTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 6,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#333",

    color: "#fff",
    // marginBottom: 6,
    textAlign: "center",
    backgroundColor: "#828080ff",
  },

  sectionBox: {
    marginBottom: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deliverablesRow: {
    flexDirection: "row",
    width: "60%",

    gap: 15,
  },

  deliverableColumn: {
    width: "25%",
    // grey bg (as in your screenshot)
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#d3cece",
    justifyContent: "flex-start",
  },

  deliverableTitle: {
    width: "25%",
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  deliverableList: {
    width: "75%", // width for bullet points
  },
  deliverableContent: {
    // marginBottom: 1,       // spacing between bullets
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    backgroundColor: "#8e8989",
    color: "#fff",
    padding: 4,
  },

  deliverableBox: {
    marginLeft: 6,
  },

  deliverableTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },

  deliverableContent: {
    fontSize: 9,

    lineHeight: 1.4,
  },

  termsHeaderBox: {
    backgroundColor: "#e0e0e0",
    padding: 6,
    marginBottom: 10,
  },

  termsHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },

  termsList: {
    paddingHorizontal: 4,
  },

  termItem: {
    fontSize: 8,
    marginBottom: 6,
    lineHeight: 1.4,
    textAlign: "justify",
  },
});
