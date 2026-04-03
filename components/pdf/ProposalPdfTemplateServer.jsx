
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   Image,
//   StyleSheet,
// } from "@react-pdf/renderer";
// import { ToWords } from "to-words";

// const ProposalPdfTemplate = ({ data }) => {
//   if (!data) {
//     return null;
//   }

//   const toWords = new ToWords({
//     localeCode: "en-IN",
//     converterOptions: {
//       currency: true,
//       ignoreDecimal: false,
//     },
//   });

//   // Format the date for display
//   const proposalDate = new Date(data.dateOfProposal).toLocaleDateString(
//     "en-GB",
//     { day: "numeric", month: "long", year: "numeric" },
//   );

//   const formatIndianCurrency = (num) => {
//     if (typeof num !== "number") return num;
//     return num.toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   };

//   // ---------------------gst amount calculation ----------------------------

//   let totalAfterServiceDiscounts = data.services.reduce((total, service) => {
//     let servicePrice = service.amount;
//     if (service.discountAmount) {
//       servicePrice -= service.discountAmount;
//     } else if (service.discountPercentage) {
//       servicePrice -= (service.amount * service.discountPercentage) / 100;
//     }

//     return total + servicePrice;
//   }, 0);

//   let tdcAmount = totalAfterServiceDiscounts * 0.02;
//   let totalGST = totalAfterServiceDiscounts * 0.18;

//   let totalAmount =
//     totalAfterServiceDiscounts + totalAfterServiceDiscounts * 0.18;
//   if (data?.tanNo) {
//     totalAmount = totalAmount - tdcAmount;
//   }

//   if (data.discount > 0) {
//     totalAfterServiceDiscounts = totalAfterServiceDiscounts - data.discount;
//   } else if (data?.discountPercentage > 0) {
//     totalAfterServiceDiscounts =
//       (totalAfterServiceDiscounts * data?.discountPercentage) / 100;
//   }

//   totalAfterServiceDiscounts = totalAfterServiceDiscounts * 0.18;

//   // ---------------------total amount calculation ----------------------------
//   let totalAmountWithGST = data.totalAmount;

//   if (data?.discount > 0) {
//     totalAmountWithGST = totalAmountWithGST - data.discount;
//   } else if (data?.discountPercentage > 0) {
//     totalAmountWithGST = (totalAmountWithGST * data?.discountPercentage) / 100;
//   }
//   let TDSAmount = totalAmountWithGST;
//   totalAmountWithGST = totalAmountWithGST * 0.18 + totalAmountWithGST;

//   // ---------------------TDS amount calculation ----------------------------
//   TDSAmount = TDSAmount * 0.02;

//   // --------------------- calculation total discount ----------------------------
//   const totalServiceDiscount = data.services.reduce((total, service) => {
//     if (service.discountAmount) {
//       return total + service.discountAmount;
//     } else if (service.discountPercentage && service.amount) {
//       return total + (service.amount * service.discountPercentage) / 100;
//     }
//     return total;
//   }, 0);

//   // --------------------- Discount show or not ----------------------------
//   const discountShow = data.services.some(
//     (service) =>
//       (service.discountAmount !== null && service.discountAmount > 0) ||
//       (service.discountPercentage !== null && service.discountPercentage > 0),
//   );

//   // total Amount in words
//   const totalAmountInWords = toWords.convert(totalAmount);

//   const BankDetailsBlock = () => (
//     <View wrap={false} minPresenceAhead={120} style={{ marginTop: 10 }}>
//       <View style={styles.bankBox}>
//         <Text>
//           Cheque/Draft to be made in favor PROMOZIONE BRANDING PRIVATE LIMITED
//         </Text>
//         <Text>PAN No.: AAMCP6194C, CIN: U92112DL2024PTC432424</Text>
//         <Text>BANK ACCOUNT NO : 77770597710 BANK NAME : ICICI BANK</Text>
//         <Text>IFSC CODE : ICIC0000254</Text>
//       </View>

//       <View style={{ fontSize: 8, marginTop: 4 }}>
//         <Text>
//           Regd. Office: Vardhman Plaza, Sector 3, Rohini, Delhi – 110085, India
//         </Text>
//         <Text>CIN: U92112DL2024PTC432424</Text>
//         <Text>011 42603232 • customercare@promozionebranding.com</Text>
//       </View>
//     </View>
//   );

//   // header comp

//   const PdfHeader = () => (
//     <View style={styles.headerWrapper} fixed>
//       <View style={styles.headerContainer}>
//         <View style={styles.leftHeader2}>
//           <Image
//             style={styles.logoSmall}
//             src={
//               "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765862267/Logo-Company_2_xnnz7x.png"
//             }
//           />
//         </View>

//         <View style={styles.rightHeader2}>
//           <Text style={styles.companyTitle}>Promozione Branding Pvt Ltd</Text>
//           <Text>Vardhman Plaza, Rohini, New Delhi</Text>
//           <Text>Call us : 011 42603232</Text>
//           <Text>Email: customercare@promozionebranding.com</Text>
//           <Text>Website: www.promozionebranding.com</Text>
//         </View>
//       </View>
//     </View>
//   );

//   // footer comp

//   const PdfFooter = () => (
//     <View style={styles.footer} fixed>
//       {/* EMAIL */}
//       <Text style={styles.email}>customercare@promozionebranding.com</Text>

//       {/* DIAMONDS */}
//       <View style={styles.diamondGroup}>
//         <View style={styles.diamond} />
//         <View style={styles.diamond} />
//         <View style={styles.diamond} />
//       </View>

//       {/* PHONE */}
//       <Text style={styles.phone}>011 - 42603232, +91 99717 00871</Text>
//     </View>
//   );

//   return (
//     <Document
//       style={{ marginTop: "0" }}
//       title={`PR-${data?.clientCompany}-${data?.proposalNo}`}
//       fileName={`PR-${data?.clientCompany}-${data?.proposalNo}`}
//     >
//       {/* PAGE 1 */}
//       <Page size="A4" style={styles.page} wrap>
//         {/* watermark */}
//         <Image
//           src={
//             "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"
//           }
//           style={styles.watermark}
//         />

//         {/* header */}
//         <PdfHeader />
//         <Text style={styles.proposalTitle}>PROPOSAL</Text>

//         {/* client details */}
//         <View style={styles.clientBox}>
//           <Text>To,</Text>
//           <Text>Client Name: {data.clientName}</Text>
//           <Text>Company name: {data.clientCompany}</Text>
//           <Text>Address: {data.clientAddress}</Text>
//           <Text>GST No.: {data.GSTIN}</Text>
//           <Text>Date: {proposalDate}</Text>
//           <Text>Proposal No. : {data?.proposalNo}</Text>
//         </View>

//         {/* table header */}
//         <View style={styles.tableRowHeader}>
//           <Text style={styles.colSN}>S.No.</Text>
//           <Text style={styles.colDesc}>Description</Text>
//           <Text style={styles.colNew}>Tenure</Text>
//           <Text style={styles.colNew}>{discountShow && "Discount"}</Text>
//           <Text style={styles.colAmt}>Amount (INR)</Text>
//         </View>

//         {/* Dynamically render services */}
//         {data.services &&
//           data.services.map((service, index) => (
//             <View style={styles.tableRow} key={service._id || index}>
//               <Text style={styles.colSN}>{index + 1}.</Text>
//               <View style={styles.colDesc}>
//                 <Text style={styles.serviceTitle}>{service.serviceTitle}</Text>
//                 {service?.description?.split(",").map((item, idx) => (
//                   <Text key={idx} style={styles.serviceName}>
//                     • {item}
//                   </Text>
//                 ))}
//               </View>
//               <Text style={styles.colNew}>{service.duration}</Text>
//               <Text style={styles.colNew}>
//                 {service.discountAmount
//                   ? formatIndianCurrency(service.discountAmount)
//                   : service.discountPercentage && service.amount
//                     ? formatIndianCurrency(
//                         (service.amount * service.discountPercentage) / 100,
//                       )
//                     : ""}
//               </Text>

//               <View style={styles.colAmt}>
//                 <Text
//                   style={{
//                     width: "30%",
//                     marginLeft: "30",
//                     textAlign: "center",
//                     fontWeight: "bold",
//                     textDecoration: "line-through",
//                   }}
//                 >
//                   {formatIndianCurrency(service.amount)}
//                 </Text>
//                 <Text style={styles.colAmt}>
//                   {service?.discountAmount
//                     ? formatIndianCurrency(
//                         service?.amount - service?.discountAmount,
//                       )
//                     : formatIndianCurrency(
//                         service?.amount -
//                           (service.amount * service.discountPercentage) / 100,
//                       )}
//                 </Text>
//               </View>
//             </View>
//           ))}
//         {discountShow && (
//           <View style={styles.totalBox}>
//             <Text style={styles.totalLabel}>Total Discount</Text>
//             <Text style={styles.totalValue}>{/* 0000.00 */}</Text>
//             <Text style={styles.totalValue}>
//               {formatIndianCurrency(totalServiceDiscount)}
//             </Text>
//           </View>
//         )}

//         {/* Tax deducted from sources  */}
//         {data?.tanNo && (
//           <View style={styles.totalBox}>
//             <Text style={styles.totalLabel}>TDS Amount (2%)</Text>
//             <Text style={styles.totalValue}>{/* 0000.00 */}</Text>
//             <Text style={styles.totalValue}>
//               {formatIndianCurrency(tdcAmount)}
//             </Text>
//           </View>
//         )}

//         <View style={styles.totalBox}>
//           <Text style={styles.totalLabel}>GST @ 18%</Text>
//           <Text style={styles.totalValue}></Text>
//           <Text style={styles.totalValue}>
//             {formatIndianCurrency(totalGST)}
//           </Text>
//         </View>

//         <View style={styles.totalBox}>
//           <Text
//             style={[styles.totalLabel, { fontWeight: "bold", fontSize: 10 }]}
//           >
//             Total Payable Amount
//           </Text>
//           <Text
//             style={[styles.totalValue, { fontWeight: "bold", fontSize: 10 }]}
//           >
//             {/* 0000.00 */}
//           </Text>

//           <Text
//             style={[styles.totalValue, { fontWeight: "bold", fontSize: 10 }]}
//           >
//             {formatIndianCurrency(totalAmount)}
//           </Text>
//         </View>

//         <View style={styles.totalBox}>
//           <Text style={[styles.totalLabelInWords]}>In Words</Text>
//           <Text style={[styles.totalValueInWords]}>{totalAmountInWords}</Text>
//         </View>

//         {data?.partlyPayment?.length > 0 &&
//           data?.partlyPayment.map(({ _id, paymentAmount, paymentDuration }) => (
//             <View style={styles.totalBox} key={_id}>
//               <Text style={styles.totalLabel}></Text>
//               <Text style={styles.totalValue}>{paymentDuration}</Text>

//               <Text style={styles.totalValue}>
//                 {formatIndianCurrency(paymentAmount)}
//               </Text>
//             </View>
//           ))}

//         {/* here is the notes  */}
//         {data?.notes && (
//           <View style={styles.notesBox}>
//             {data?.notes?.split(",").map((item, idx) => (
//               <Text
//                 key={idx}
//                 style={
//                   idx === 0
//                     ? styles.noteText
//                     : { marginLeft: 23, fontSize: 8.5 }
//                 }
//               >
//                 {idx === 0 ? "Note: " : ""}• {item.trim()}
//               </Text>
//             ))}
//           </View>
//         )}

//         {/* terms */}
//         <View style={styles.termsBox} wrap>
//           <Text>
//             • This is an application for Promozione Branding Private Limited
//             services. An order confirmation may be done on phone/email before
//             booking the order
//           </Text>

//           <Text>
//             • Please check all the details given in the proposal before
//             approving, there would not be any changes post deal confirmation.
//           </Text>

//           <Text>
//             • All online content including text & pictures are to be provided by
//             the client who should be the legal copyright owner of the same.
//             Promozione Branding shall not be liable for any claims/damages
//             arising out of content posted on your catalog
//           </Text>

//           <Text>
//             • Charges for subsequent years shall be as per the rate at that
//             time, which may be higher than the current charges.
//           </Text>
//           <Text>
//             • Work on services shall commence only after clearance of cheque/pay
//             order.
//           </Text>

//           <Text>
//             • Pursuant to the approval of this proposal, The Customer hereby
//             allows Promozione Branding Private Limited to make commercial calls
//             on its registered mobile number(s) and organization's contact
//             number(s
//           </Text>

//           <Text>
//             • This declaration will hold valid even if the customer chooses to
//             get its numbers registered for NDNC at any future date.
//           </Text>
//           <Text>
//             • All services are offered without any performance guarantee in
//             terms of number of enquiries, confirmed orders etc.
//           </Text>
//         </View>

//         <View style={styles.termsBox} wrap>
//           <BankDetailsBlock />
//         </View>

//         <PdfFooter />
//       </Page>

//       {/* PAGE 2 */}

//       <Page size="A4" style={styles.page}>
//         <Image
//           src={
//             "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"
//           }
//           style={styles.watermark}
//           fixed
//         />

//         {/* header */}
//         <PdfHeader />

//         {/* SECTION TITLE */}
//         <Text style={styles.sectionMainTitle}>
//           Service Offerings and Deliverables
//         </Text>

//         {/* WEBSITE */}
//         <View style={styles.sectionBox} wrap>
//           <Text style={styles.sectionTitle}>Website Development</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>

//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Coding based Web development
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Product Addition - upto 150 Products
//               </Text>
//               <Text style={styles.deliverableContent}>• Graphic Designing</Text>
//               <Text style={styles.deliverableContent}>• Free Domain</Text>
//               <Text style={styles.deliverableContent}>
//                 • 3 Banner for Hero Section
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Custom UI & UX (No Templates)
//               </Text>
//               <Text style={styles.deliverableContent}>• 1 year Hosting</Text>
//               <Text style={styles.deliverableContent}>
//                 • One keyword Ranking on Google’s 1st page
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Core web vitals optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Advanced page speed optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Image compression & Lazy loading
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Google tag manager setup
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Monthly website health report
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Priority Support SCA
//               </Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>• Corporate Website</Text>
//               <Text style={styles.deliverableContent}>
//                 • Website Maintenance
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Website Enrichment in 72 hr
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Trust Elite Certificate
//               </Text>
//               <Text style={styles.deliverableContent}>• Blog Building</Text>
//               <Text style={styles.deliverableContent}>
//                 • Free SSL certificate
//               </Text>
//               <Text style={styles.deliverableContent}>• 1 year Hosting</Text>
//               <Text style={styles.deliverableContent}>
//                 • Mobile Friendly Website
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Daily/ Weekly automated backups
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • HTTPS + Security Headers
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Lead Capture Forms
//               </Text>
//               <Text style={styles.deliverableContent}>• CTA Optimization</Text>
//               <Text style={styles.deliverableContent}>
//                 • Whatsapp Chat Integration
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Click to Call for mobile users
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Revenue */}
//         <View style={styles.sectionBox} wrap>
//           <Text style={styles.sectionTitle}>Revenue Marketing</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>

//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>• B2B Marketing</Text>
//               <Text style={styles.deliverableContent}>• B2C Marketing</Text>
//               <Text style={styles.deliverableContent}>• D2C Marketing</Text>
//               <Text style={styles.deliverableContent}>
//                 • AI Performance Marketing Services
//               </Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>• Ads Management</Text>
//               <Text style={styles.deliverableContent}>
//                 • Internet Marketing
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Performance Marketing
//               </Text>
//               <Text style={styles.deliverableContent}>• Demand Generation</Text>
//             </View>
//           </View>
//         </View>

//         {/* SOCIAL MEDIA MANAGEMENT */}
//         <View style={styles.sectionBox} wrap>
//           <Text style={styles.sectionTitle}>Social Media Management</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Posting and Account handling
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Infographic Posts - 3 per week
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Reels - 1 per week
//               </Text>
//               <Text style={styles.deliverableContent}>• Festive posts</Text>
//               <Text style={styles.deliverableContent}>
//                 • Monthly social content calender
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Platform wise strategy-IG, FB, YT & Linkedin
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Hashtag research and strategy
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Custom posts and templates
//               </Text>
//             </View>

//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Google my business posts
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Community Management
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Post sharing in multiple communities
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Comment and DM engagement handling
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Content performance insights
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Monthly performance reports
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Engagement and follower insights
//               </Text>
//               {/* <Text style={styles.deliverableContent}>
//                 • Reach, Engagement and Follower growth analysis
//               </Text> */}
//               <Text style={styles.deliverableContent}>
//                 • Promotional campaigns and Offer posts
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Google Ads Management */}
//         <View style={styles.sectionBoxForGoogleAds} wrap>
//           <Text style={styles.sectionTitle}>Google Ads Management</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>• Ads account setup</Text>
//               <Text style={styles.deliverableContent}>
//                 • Landing Page for specific targeting
//               </Text>
//               <Text style={styles.deliverableContent}>• Content Creation</Text>
//               <Text style={styles.deliverableContent}>
//                 • Strategy and setup
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Keyword research and Intent mapping
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Competitors’ Ads analysis
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Google Analytics Integration
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Conversion tracking setup
//               </Text>
//             </View>

//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Responsive Search Ads
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Negative Keyword Management
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • A/B Testing of ad copies
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Cost per Lead optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Landing Page optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Daily bid and budget optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Keyword optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Daily performance report sharing
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* SEO */}
//         <View style={styles.sectionBox} wrap>
//           <Text style={styles.sectionTitle}>Organic Search Growth</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Pan India Targeting
//               </Text>
//               <Text style={styles.deliverableContent}>• Keyword Strategy</Text>
//               <Text style={styles.deliverableContent}>• 1st Page Ranking</Text>
//               <Text style={styles.deliverableContent}>
//                 • On-page Optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Content Enhancement
//               </Text>
//               <Text style={styles.deliverableContent}>• Authority Builder</Text>
//               <Text style={styles.deliverableContent}>• Month Reporting</Text>
//               <Text style={styles.deliverableContent}>• Keyword Strategy</Text>
//               <Text style={styles.deliverableContent}>• Google Analytics</Text>
//             </View>

//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • On page & Off page SEO
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Backlinks Creation
//               </Text>
//               <Text style={styles.deliverableContent}>• Website Ranking</Text>
//               <Text style={styles.deliverableContent}>
//                 • Technical Optimization
//               </Text>
//               <Text style={styles.deliverableContent}>• Search Monitoring</Text>
//               <Text style={styles.deliverableContent}>• Ranking Tracking</Text>
//               <Text style={styles.deliverableContent}>• Meta Integration</Text>
//               <Text style={styles.deliverableContent}>
//                 • Google Search Console
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Meta Ads Management */}
//         <View style={styles.sectionBox} wrap>
//           <Text style={styles.sectionTitle}>Meta Ads Management</Text>
//           <View style={styles.deliverablesRow}>
//             <View style={styles.deliverableColumn}>
//               <Text style={styles.deliverableTitle}>Deliverables</Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Meta Business Manager setup
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Funnel based Ads strategy
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Competitor creative analysis
//               </Text>
//               <Text style={styles.deliverableContent}>• Audience research</Text>
//               <Text style={styles.deliverableContent}>
//                 • Facebook Pixel and Conversion API setup
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Ad account configuration
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Ad creative designing
//               </Text>
//             </View>
//             <View style={styles.deliverableList}>
//               <Text style={styles.deliverableContent}>
//                 • Ad creative designing
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Creative A/B Testing
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Daily performance monitoring & reporting
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • CPC/CPA optimization
//               </Text>
//               <Text style={styles.deliverableContent}>
//                 • Whatsapp integration based configuration
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* TERMS HEADING */}
//         <View style={styles.maintermhead}>
//           <View style={styles.termsHeaderBox}>
//             <Text style={styles.termsHeader}>Terms & Conditions</Text>
//           </View>

//           {/* TERMS LIST */}
//           <View style={styles.termsList}>
//             <Text style={styles.termItem} wrap>
//               1) Promozione Branding Private Limited excludes any warranty,
//               express or implied, as to the quality, accuracy, timeliness,
//               completeness, performance, fitness, for a particular purpose of
//               any of its contents, hosted on any of Promozione Branding Private
//               Limited servers, unless otherwise specified in writing.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               2) Promozione Branding Private Limited will not be liable for any
//               damages (including, without limitation, damages for loss of
//               business projects, or loss of profits) arising in contract, tort
//               or otherwise from the use of or inability to use any site or any
//               of its contents.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               3) You indemnify Promozione Branding Private Limited of all
//               claims, conflicts or legal proceedings arising out of all
//               information, data, text, software, music, sound, photographs,
//               graphics, videos, messages or any other material ("content")
//               posted on the website or privately transmitted.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               4) You are responsible for ensuring that material on your site
//               complies with National and International Laws.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               5) Promozione Branding Private Limited reserves the right to add
//               or change these terms & conditions as and when required without
//               giving any notice. Changes will be deemed accepted if you continue
//               to use the services.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               6) Corporate Profile prepared by third-party agencies will be a
//               compilation of information of your organization. Promozione
//               Branding Private Limited will be authorized to use this
//               information for promotional purposes.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               7) Refund of any amount is at the sole discretion of the company.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               8) Promozione Branding Private Limited may have an option to
//               convert your service to an annual service plan. If unable to pay
//               the outstanding amount, you may need to discontinue the service
//               plan.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               9) Promozione Branding Private Limited reserves the right to
//               add/modify/discontinue features offered with a service.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               10) To ensure excellent customer service, your calls may be
//               monitored or recorded.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               11) Any discounts offered are subject to continuation of service
//               for the subscribed period. Early discontinuation will lead to
//               charges as per applicable rates.
//             </Text>

//             <Text style={styles.termItem} wrap>
//               12) By accepting this document, you agree to these terms and to
//               the Terms & Conditions of Use located at:
//               https://promozionebranding.com/terms/
//             </Text>
//           </View>
//         </View>

//         <PdfFooter />
//       </Page>

//       {/* page 3 */}

//       {/* <Page size="A4" style={styles.page} >
//         <Image
//           src={
//             "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"
//           }
//           style={styles.watermark}
//         />

   
//        <PdfHeader />

      
//         <View style={styles.termsHeaderBox}  >
//           <Text style={styles.termsHeader}>Terms & Conditions</Text>
//         </View>

    
//         <View style={styles.termsList} >
//           <Text style={styles.termItem} wrap>
//             1) Promozione Branding Private Limited excludes any warranty,
//             express or implied, as to the quality, accuracy, timeliness,
//             completeness, performance, fitness, for a particular purpose of any
//             of its contents, hosted on any of Promozione Branding Private
//             Limited servers, unless otherwise specified in writing.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             2) Promozione Branding Private Limited will not be liable for any
//             damages (including, without limitation, damages for loss of business
//             projects, or loss of profits) arising in contract, tort or otherwise
//             from the use of or inability to use any site or any of its contents.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             3) You indemnify Promozione Branding Private Limited of all claims,
//             conflicts or legal proceedings arising out of all information, data,
//             text, software, music, sound, photographs, graphics, videos,
//             messages or any other material ("content") posted on the website or
//             privately transmitted.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             4) You are responsible for ensuring that material on your site
//             complies with National and International Laws.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             5) Promozione Branding Private Limited reserves the right to add or
//             change these terms & conditions as and when required without giving
//             any notice. Changes will be deemed accepted if you continue to use
//             the services.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             6) Corporate Profile prepared by third-party agencies will be a
//             compilation of information of your organization. Promozione Branding
//             Private Limited will be authorized to use this information for
//             promotional purposes.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             7) Refund of any amount is at the sole discretion of the company.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             8) Promozione Branding Private Limited may have an option to convert
//             your service to an annual service plan. If unable to pay the
//             outstanding amount, you may need to discontinue the service plan.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             9) Promozione Branding Private Limited reserves the right to
//             add/modify/discontinue features offered with a service.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             10) To ensure excellent customer service, your calls may be
//             monitored or recorded.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             11) Any discounts offered are subject to continuation of service for
//             the subscribed period. Early discontinuation will lead to charges as
//             per applicable rates.
//           </Text>

//           <Text style={styles.termItem} wrap>
//             12) By accepting this document, you agree to these terms and to the
//             Terms & Conditions of Use located at:
//             https://promozionebranding.com/terms/
//           </Text>
//         </View>
//       </Page> */}
//     </Document>
//   );
// };

// export default ProposalPdfTemplate;

// /* ---------------- STYLES ---------------- */

// const styles = StyleSheet.create({
//   page: {
//     paddingLeft: 30,
//     paddingRight: 30,
//     fontSize: 10,
//     fontFamily: "Helvetica",
//     lineHeight: 1.5,
//     position: "relative",
//   },

//   watermark: {
//     position: "absolute",
//     top: "30%",
//     width: 450,
//     left: "12%",
//     height: 450,
//     opacity: 0.08,
//     objectFit: "contain",
//   },

//   headerContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderColor: "#d0d0d0",
//     padding: 10,
//   },

//   /* FIRST PAGE HEADER */
//   leftHeader: {
//     width: 130,
//     justifyContent: "flex-start",
//   },

//   logo: {
//     width: 100,
//     height: 100,
//     objectFit: "contain",
//     borderRadius: 20,
//     left: -10,
//   },

//   rightHeader: {
//     width: "55%",
//     textAlign: "right",
//   },

//   companyTitle: {
//     fontSize: 17,
//     fontWeight: "bold",
//     marginBottom: 4,
//     color: "#333",
//   },

//   proposalTitle: {
//     textAlign: "center",
//     fontSize: 16,
//     fontWeight: "bold",
//     margin: 10,
//     color: "#222",
//   },

//   clientBox: {
//     backgroundColor: "#f8f8f8",
//     padding: 7,
//     borderRadius: 4,
//     marginBottom: 10,
//     borderLeftWidth: 3,
//     borderColor: "#7E9AA2",
//   },

//   tableRowHeader: {
//     flexDirection: "row",
//     backgroundColor: "#efefef",
//     paddingVertical: 7,
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#ccc",
//   },

//   tableRow: {
//     flexDirection: "row",
//     paddingVertical: 5,
//     borderBottomWidth: 1,
//     borderColor: "#e0e0e0",
//   },

//   colNew: {
//     width: "35%",
//     textAlign: "center",
//     fontWeight: "bold",
//   },

//   colSN: {
//     width: "10%",
//     paddingLeft: 5,
//     fontWeight: "bold",
//   },

//   colDesc: {
//     width: "45%",
//     paddingLeft: 5,
//     fontWeight: "bold",
//   },

//   colAmt: {
//     width: "30%",
//     marginLeft: "30",
//     textAlign: "center",
//     fontWeight: "bold",
//   },

//   colAmtNew: {
//     width: "30%",
//     marginLeft: "30",
//     textAlign: "center",
//     fontWeight: "bold",
//   },

//   serviceTitle: {
//     fontWeight: "bold",
//   },

//   serviceName: {
//     fontSize: 8,
//     fontWeight: "bold",
//   },

//   totalBox: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     borderBottomWidth: 1,
//     borderColor: "#dcdcdc",
//     marginTop: 2,
//   },

//   totalLabel: {
//     fontWeight: "normal",
//     fontSize: 8,
//   },

//   totalValue: {
//     width: "20%",
//     textAlign: "right",
//     fontWeight: "normal",
//     fontSize: 8,
//   },

//   totalLabelInWords: {
//     fontWeight: "bold",
//     fontSize: 10,
//     width: "40%",
//     textAlign: "left",
//   },

//   totalValueInWords: {
//     width: "70%",
//     textAlign: "right",
//     fontSize: 8,
//   },

//   termsBox: {
//     marginTop: 14,
//     fontSize: 8,
//     lineHeight: 1.5,
//   },

//   notesBox: {
//     // marginTop: 2,
//     paddingTop: 5,
//   },

//   noteText: {
//     fontSize: 8.5,
//   },

//   /* ---------------- PAGE 2 ---------------- */

//   leftHeader2: {
//     width: 130,
//     justifyContent: "flex-start",
//   },

//   logoSmall: {
//     width: 80,
//     height: 80,
//     borderRadius: 20,
//     marginBottom: 10,
//     marginTop: 10,
//     objectFit: "cover",
//   },

//   rightHeader2: {
//     width: "55%",
//     textAlign: "right",
//   },

//   bankBox: {
//     backgroundColor: "#F8F8F8",
//     padding: 4,
//     fontSize: 8,
//     borderLeftWidth: 3,
//     borderColor: "#7E9AA2",
//   },

//   sectionMainTitle: {
//     fontSize: 15,
//     fontWeight: "bold",
//     marginTop: 6,
//     marginBottom: 10,
//     padding: 8,
//     borderBottomWidth: 1,
//     borderColor: "#333",

//     color: "#fff",
//     textAlign: "center",
//     backgroundColor: "#828080ff",
//   },

//   sectionBox: {
//     marginBottom: 8,
//     padding: 4,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   deliverablesRow: {
//     flexDirection: "row",
//     width: "90%",

//     gap: 15,
//   },

//   deliverableColumn: {
//     width: "40%",
//     padding: 4,
//     borderRightWidth: 1,
//     borderColor: "#d3cece",
//     justifyContent: "flex-start",
//   },

//   deliverableTitle: {
//     width: "40%",
//     fontWeight: "bold",

//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   deliverableList: {
//     width: "100%", // width for bullet points
//     padding: 2,
//   },
//   deliverableContent: {
//     // marginBottom: 1,
//     fontSize: 15,
//     marginTop: 4,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 2,
//     backgroundColor: "#5C5959",
//     color: "#fff",
//     padding: 5,
//   },

//   deliverableBox: {
//     marginLeft: 6,
//     marginTop: 4,
//   },

//   deliverableTitle: {
//     fontSize: 11,
//     fontWeight: "bold",
//     marginBottom: 2,
//   },

//   deliverableContent: {
//     fontSize: 9,

//     lineHeight: 1.4,
//   },

//   maintermhead: {
//     marginBottom: 130,
//     marginTop: 10,
//   },

//   termsHeaderBox: {
//     backgroundColor: "#e0e0e0",
//     padding: 6,
//     marginBottom: 10,
//     marginTop: 20,
//   },

//   termsHeader: {
//     fontSize: 12,
//     fontWeight: "bold",
//   },

//   termsList: {
//     paddingHorizontal: 4,
//   },

//   termItem: {
//     fontSize: 7,
//     marginBottom: 6,
//     lineHeight: 1.1,
//     textAlign: "justify",
//     color: "#696969",
//   },

//   // for the service in the pdf of google search

//   sectionBoxForGoogleAds: {
//     // marginTop: 60,
//     padding: 4,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },

//   // fooetr

//   footer: {
//     borderTop: 1,
//     marginTop: 18,

//     padding: 3,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     fontSize: 10,
//   },

//   leftSection: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   line: {
//     width: 120,
//     height: 1,
//     backgroundColor: "#000",
//     marginRight: 10,
//   },

//   email: {
//     color: "#2a5db0",
//     textDecoration: "underline",
//     marginRight: 10,
//   },

//   diamondGroup: {
//     flexDirection: "row",
//     marginHorizontal: 10,
//   },

//   diamond: {
//     width: 6,
//     height: 6,
//     backgroundColor: "#000",
//     marginHorizontal: 2,
//     transform: "rotate(45deg)",
//   },

//   phone: {
//     fontSize: 10,
//   },
// });
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
    { day: "numeric", month: "long", year: "numeric" },
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
      (service.discountPercentage !== null && service.discountPercentage > 0),
  );

  // total Amount in words
  const totalAmountInWords = toWords.convert(totalAmount);

  const BankDetailsBlock = () => (
    <View wrap={false} minPresenceAhead={120} style={{ marginTop: 10 }}>
      <View style={styles.bankBox}>
        <Text>
          Cheque/Draft to be made in favor PROMOZIONE BRANDING PRIVATE LIMITED
        </Text>
        <Text>PAN No.: AAMCP6194C, CIN: U92112DL2024PTC432424</Text>
        <Text>BANK ACCOUNT NO : 77770597710 BANK NAME : ICICI BANK</Text>
        <Text>IFSC CODE : ICIC0000254</Text>
      </View>

      <View style={{ fontSize: 8, marginTop: 4 }}>
        <Text>
          Regd. Office: Vardhman Plaza, Sector 3, Rohini, Delhi – 110085, India
        </Text>
        <Text>CIN: U92112DL2024PTC432424</Text>
        <Text>011 42603232 • customercare@promozionebranding.com</Text>
      </View>
    </View>
  );

  // header comp

  const PdfHeader = () => (
    <View style={styles.headerWrapper} fixed>
      <View style={styles.headerContainer}>
        <View style={styles.leftHeader2}>
          <Image style={styles.logoSmall} src={"https://res.cloudinary.com/ddfglmkbd/image/upload/v1765862267/Logo-Company_2_xnnz7x.png"} />
        </View>

        <View style={styles.rightHeader2}>
          <Text style={styles.companyTitle}>Promozione Branding Pvt Ltd</Text>
          <Text>Vardhman Plaza, Rohini, New Delhi</Text>
          <Text>Call us : 011 42603232</Text>
          <Text>Email: customercare@promozionebranding.com</Text>
          <Text>Website: www.promozionebranding.com</Text>
        </View>
      </View>
    </View>
  );

  // footer comp

  const PdfFooter = () => (
    <View style={styles.footer} fixed>
      {/* EMAIL */}
      <Text style={styles.email}>customercare@promozionebranding.com</Text>

      {/* DIAMONDS */}
      <View style={styles.diamondGroup}>
        <View style={styles.diamond} />
        <View style={styles.diamond} />
        <View style={styles.diamond} />
      </View>

      {/* PHONE */}
      <Text style={styles.phone}>011 - 42603232, +91 99717 00871</Text>
    </View>
  );

  return (
    <Document
      style={{ marginTop: "0" }}
      title={`PR-${data?.clientCompany}-${data?.proposalNo}`}
      fileName={`PR-${data?.clientCompany}-${data?.proposalNo}`}
    >
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page} wrap>
        {/* watermark */}
        <Image src={ "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"} style={styles.watermark} />

        {/* header */}
        <PdfHeader />
        <Text style={styles.proposalTitle}>PROPOSAL</Text>

        {/* client details */}
        <View style={styles.clientBox}>
          <Text>To,</Text>
          <Text>Client Name: {data.clientName}</Text>
          <Text>Company name: {data.clientCompany}</Text>
          <Text>Address: {data.clientAddress}</Text>
          <Text>GST No.: {data.GSTIN}</Text>
          <Text>Date: {proposalDate}</Text>
          <Text>Proposal No. : {data?.proposalNo}</Text>
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
                {service?.description?.split(",").map((item, idx) => (
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
                        (service.amount * service.discountPercentage) / 100,
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
                        service?.amount - service?.discountAmount,
                      )
                    : formatIndianCurrency(
                        service?.amount -
                          (service.amount * service.discountPercentage) / 100,
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

        {data?.partlyPayment?.length > 0 &&
          data?.partlyPayment.map(({ _id, paymentAmount, paymentDuration }) => (
            <View style={styles.totalBox} key={_id}>
              <Text style={styles.totalLabel}></Text>
              <Text style={styles.totalValue}>{paymentDuration}</Text>

              <Text style={styles.totalValue}>
                {formatIndianCurrency(paymentAmount)}
              </Text>
            </View>
          ))}

        {/* here is the notes  */}
        {data?.notes && (
          <View style={styles.notesBox}>
            {data?.notes?.split(",").map((item, idx) => (
              <Text
                key={idx}
                style={
                  idx === 0
                    ? styles.noteText
                    : { marginLeft: 23, fontSize: 8.5 }
                }
              >
                {idx === 0 ? "Note: " : ""}• {item.trim()}
              </Text>
            ))}
          </View>
        )}

        {/* terms */}
        <View style={styles.termsBox} wrap>
          <Text>
            • This is an application for Promozione Branding Private Limited
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
            Promozione Branding shall not be liable for any claims/damages
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
            allows Promozione Branding Private Limited to make commercial calls
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

        <View style={styles.termsBox} wrap>
          <BankDetailsBlock />
        </View>

        <PdfFooter />
      </Page>

      {/* PAGE 2 */}

      <Page size="A4" style={styles.page}>
        <Image src={"https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"} style={styles.watermark} fixed />

        {/* header */}
        <PdfHeader />

        {/* SECTION TITLE */}
        <Text style={styles.sectionMainTitle}>
          Service Offerings and Deliverables
        </Text>

        {/* WEBSITE */}
        <View style={styles.sectionBox} wrap>
          <Text style={styles.sectionTitle}>Website Development</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>

            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Coding based Web development
              </Text>
              <Text style={styles.deliverableContent}>
                • Product Addition - upto 150 Products
              </Text>
              <Text style={styles.deliverableContent}>• Graphic Designing</Text>
              <Text style={styles.deliverableContent}>• Free Domain</Text>
              <Text style={styles.deliverableContent}>
                • 3 Banner for Hero Section
              </Text>
              <Text style={styles.deliverableContent}>
                • Custom UI & UX (No Templates)
              </Text>
              <Text style={styles.deliverableContent}>• 1 year Hosting</Text>
              <Text style={styles.deliverableContent}>
                • One keyword Ranking on Google’s 1st page
              </Text>
              <Text style={styles.deliverableContent}>
                • Core web vitals optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Advanced page speed optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Image compression & Lazy loading
              </Text>
              <Text style={styles.deliverableContent}>
                • Google tag manager setup
              </Text>
              <Text style={styles.deliverableContent}>
                • Monthly website health report
              </Text>
              <Text style={styles.deliverableContent}>
                • Priority Support SCA
              </Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Corporate Website</Text>
              <Text style={styles.deliverableContent}>
                • Website Maintenance
              </Text>
              <Text style={styles.deliverableContent}>
                • Website Enrichment in 72 hr
              </Text>
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
              <Text style={styles.deliverableContent}>
                • Daily/ Weekly automated backups
              </Text>
              <Text style={styles.deliverableContent}>
                • HTTPS + Security Headers
              </Text>
              <Text style={styles.deliverableContent}>
                • Lead Capture Forms
              </Text>
              <Text style={styles.deliverableContent}>• CTA Optimization</Text>
              <Text style={styles.deliverableContent}>
                • Whatsapp Chat Integration
              </Text>
              <Text style={styles.deliverableContent}>
                • Click to Call for mobile users
              </Text>
            </View>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.sectionBox} wrap>
          <Text style={styles.sectionTitle}>Revenue Marketing</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>

            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• B2B Marketing</Text>
              <Text style={styles.deliverableContent}>• B2C Marketing</Text>
              <Text style={styles.deliverableContent}>• D2C Marketing</Text>
              <Text style={styles.deliverableContent}>
                • AI Performance Marketing Services
              </Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Ads Management</Text>
              <Text style={styles.deliverableContent}>
                • Internet Marketing
              </Text>
              <Text style={styles.deliverableContent}>
                • Performance Marketing
              </Text>
              <Text style={styles.deliverableContent}>• Demand Generation</Text>
            </View>
          </View>
        </View>

        {/* SOCIAL MEDIA MANAGEMENT */}
        <View style={styles.sectionBox} wrap>
          <Text style={styles.sectionTitle}>Social Media Management</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Posting and Account handling
              </Text>
              <Text style={styles.deliverableContent}>
                • Infographic Posts - 3 per week
              </Text>
              <Text style={styles.deliverableContent}>
                • Reels - 1 per week
              </Text>
              <Text style={styles.deliverableContent}>• Festive posts</Text>
              <Text style={styles.deliverableContent}>
                • Monthly social content calender
              </Text>
              <Text style={styles.deliverableContent}>
                • Platform wise strategy-IG, FB, YT & Linkedin
              </Text>
              <Text style={styles.deliverableContent}>
                • Hashtag research and strategy
              </Text>
              <Text style={styles.deliverableContent}>
                • Custom posts and templates
              </Text>
            </View>

            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Google my business posts
              </Text>
              <Text style={styles.deliverableContent}>
                • Community Management
              </Text>
              <Text style={styles.deliverableContent}>
                • Post sharing in multiple communities
              </Text>
              <Text style={styles.deliverableContent}>
                • Comment and DM engagement handling
              </Text>
              <Text style={styles.deliverableContent}>
                • Content performance insights
              </Text>
              <Text style={styles.deliverableContent}>
                • Monthly performance reports
              </Text>
              <Text style={styles.deliverableContent}>
                • Engagement and follower insights
              </Text>
              {/* <Text style={styles.deliverableContent}>
                • Reach, Engagement and Follower growth analysis
              </Text> */}
              <Text style={styles.deliverableContent}>
                • Promotional campaigns and Offer posts
              </Text>
            </View>
          </View>
        </View>

        {/* Google Ads Management */}
        <View style={styles.sectionBoxForGoogleAds} wrap>
          <Text style={styles.sectionTitle}>Google Ads Management</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>• Ads account setup</Text>
              <Text style={styles.deliverableContent}>
                • Landing Page for specific targeting
              </Text>
              <Text style={styles.deliverableContent}>• Content Creation</Text>
              <Text style={styles.deliverableContent}>
                • Strategy and setup
              </Text>
              <Text style={styles.deliverableContent}>
                • Keyword research and Intent mapping
              </Text>
              <Text style={styles.deliverableContent}>
                • Competitors’ Ads analysis
              </Text>
              <Text style={styles.deliverableContent}>
                • Google Analytics Integration
              </Text>
              <Text style={styles.deliverableContent}>
                • Conversion tracking setup
              </Text>
            </View>

            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Responsive Search Ads
              </Text>
              <Text style={styles.deliverableContent}>
                • Negative Keyword Management
              </Text>
              <Text style={styles.deliverableContent}>
                • A/B Testing of ad copies
              </Text>
              <Text style={styles.deliverableContent}>
                • Cost per Lead optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Landing Page optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Daily bid and budget optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Keyword optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Daily performance report sharing
              </Text>
            </View>
          </View>
        </View>

        {/* SEO */}
        <View style={styles.sectionBox} wrap>
          <Text style={styles.sectionTitle}>Organic Search Growth</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Pan India Targeting
              </Text>
              <Text style={styles.deliverableContent}>• Keyword Strategy</Text>
              <Text style={styles.deliverableContent}>• 1st Page Ranking</Text>
              <Text style={styles.deliverableContent}>
                • On-page Optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Content Enhancement
              </Text>
              <Text style={styles.deliverableContent}>• Authority Builder</Text>
              <Text style={styles.deliverableContent}>• Month Reporting</Text>
              <Text style={styles.deliverableContent}>• Keyword Strategy</Text>
              <Text style={styles.deliverableContent}>• Google Analytics</Text>
            </View>

            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • On page & Off page SEO
              </Text>
              <Text style={styles.deliverableContent}>
                • Backlinks Creation
              </Text>
              <Text style={styles.deliverableContent}>• Website Ranking</Text>
              <Text style={styles.deliverableContent}>
                • Technical Optimization
              </Text>
              <Text style={styles.deliverableContent}>• Search Monitoring</Text>
              <Text style={styles.deliverableContent}>• Ranking Tracking</Text>
              <Text style={styles.deliverableContent}>• Meta Integration</Text>
              <Text style={styles.deliverableContent}>
                • Google Search Console
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Ads Management */}
        <View style={styles.sectionBox} wrap>
          <Text style={styles.sectionTitle}>Meta Ads Management</Text>
          <View style={styles.deliverablesRow}>
            <View style={styles.deliverableColumn}>
              <Text style={styles.deliverableTitle}>Deliverables</Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Meta Business Manager setup
              </Text>
              <Text style={styles.deliverableContent}>
                • Funnel based Ads strategy
              </Text>
              <Text style={styles.deliverableContent}>
                • Competitor creative analysis
              </Text>
              <Text style={styles.deliverableContent}>• Audience research</Text>
              <Text style={styles.deliverableContent}>
                • Facebook Pixel and Conversion API setup
              </Text>
              <Text style={styles.deliverableContent}>
                • Ad account configuration
              </Text>
              <Text style={styles.deliverableContent}>
                • Ad creative designing
              </Text>
            </View>
            <View style={styles.deliverableList}>
              <Text style={styles.deliverableContent}>
                • Ad creative designing
              </Text>
              <Text style={styles.deliverableContent}>
                • Creative A/B Testing
              </Text>
              {/* <Text style={styles.deliverableContent}>
                • Daily Performance Monitoring and Report sharing
              </Text> */}
              <Text style={styles.deliverableContent}>
                • Daily performance monitoring & reporting
              </Text>
              <Text style={styles.deliverableContent}>
                • CPC/CPA optimization
              </Text>
              <Text style={styles.deliverableContent}>
                • Whatsapp integration based configuration
              </Text>
            </View>
          </View>
        </View>

        {/* TERMS HEADING */}
        <View style={styles.maintermhead}>
          <View style={styles.termsHeaderBox}>
            <Text style={styles.termsHeader}>Terms & Conditions</Text>
          </View>

          {/* TERMS LIST */}
          <View style={styles.termsList}>
            <Text style={styles.termItem} wrap>
              1) Promozione Branding Private Limited excludes any warranty,
              express or implied, as to the quality, accuracy, timeliness,
              completeness, performance, fitness, for a particular purpose of
              any of its contents, hosted on any of Promozione Branding Private
              Limited servers, unless otherwise specified in writing.
            </Text>

            <Text style={styles.termItem} wrap>
              2) Promozione Branding Private Limited will not be liable for any
              damages (including, without limitation, damages for loss of
              business projects, or loss of profits) arising in contract, tort
              or otherwise from the use of or inability to use any site or any
              of its contents.
            </Text>

            <Text style={styles.termItem} wrap>
              3) You indemnify Promozione Branding Private Limited of all
              claims, conflicts or legal proceedings arising out of all
              information, data, text, software, music, sound, photographs,
              graphics, videos, messages or any other material ("content")
              posted on the website or privately transmitted.
            </Text>

            <Text style={styles.termItem} wrap>
              4) You are responsible for ensuring that material on your site
              complies with National and International Laws.
            </Text>

            <Text style={styles.termItem} wrap>
              5) Promozione Branding Private Limited reserves the right to add
              or change these terms & conditions as and when required without
              giving any notice. Changes will be deemed accepted if you continue
              to use the services.
            </Text>

            <Text style={styles.termItem} wrap>
              6) Corporate Profile prepared by third-party agencies will be a
              compilation of information of your organization. Promozione
              Branding Private Limited will be authorized to use this
              information for promotional purposes.
            </Text>

            <Text style={styles.termItem} wrap>
              7) Refund of any amount is at the sole discretion of the company.
            </Text>

            <Text style={styles.termItem} wrap>
              8) Promozione Branding Private Limited may have an option to
              convert your service to an annual service plan. If unable to pay
              the outstanding amount, you may need to discontinue the service
              plan.
            </Text>

            <Text style={styles.termItem} wrap>
              9) Promozione Branding Private Limited reserves the right to
              add/modify/discontinue features offered with a service.
            </Text>

            <Text style={styles.termItem} wrap>
              10) To ensure excellent customer service, your calls may be
              monitored or recorded.
            </Text>

            <Text style={styles.termItem} wrap>
              11) Any discounts offered are subject to continuation of service
              for the subscribed period. Early discontinuation will lead to
              charges as per applicable rates.
            </Text>

            <Text style={styles.termItem} wrap>
              12) By accepting this document, you agree to these terms and to
              the Terms & Conditions of Use located at:
              https://promozionebranding.com/terms/
            </Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* page 3 */}

      {/* <Page size="A4" style={styles.page} >
        <Image
          src={
            "https://res.cloudinary.com/ddfglmkbd/image/upload/v1765437572/logo2_wznumr.png"
          }
          style={styles.watermark}
        />

   
       <PdfHeader />

      
        <View style={styles.termsHeaderBox}  >
          <Text style={styles.termsHeader}>Terms & Conditions</Text>
        </View>

    
        <View style={styles.termsList} >
          <Text style={styles.termItem} wrap>
            1) Promozione Branding Private Limited excludes any warranty,
            express or implied, as to the quality, accuracy, timeliness,
            completeness, performance, fitness, for a particular purpose of any
            of its contents, hosted on any of Promozione Branding Private
            Limited servers, unless otherwise specified in writing.
          </Text>

          <Text style={styles.termItem} wrap>
            2) Promozione Branding Private Limited will not be liable for any
            damages (including, without limitation, damages for loss of business
            projects, or loss of profits) arising in contract, tort or otherwise
            from the use of or inability to use any site or any of its contents.
          </Text>

          <Text style={styles.termItem} wrap>
            3) You indemnify Promozione Branding Private Limited of all claims,
            conflicts or legal proceedings arising out of all information, data,
            text, software, music, sound, photographs, graphics, videos,
            messages or any other material ("content") posted on the website or
            privately transmitted.
          </Text>

          <Text style={styles.termItem} wrap>
            4) You are responsible for ensuring that material on your site
            complies with National and International Laws.
          </Text>

          <Text style={styles.termItem} wrap>
            5) Promozione Branding Private Limited reserves the right to add or
            change these terms & conditions as and when required without giving
            any notice. Changes will be deemed accepted if you continue to use
            the services.
          </Text>

          <Text style={styles.termItem} wrap>
            6) Corporate Profile prepared by third-party agencies will be a
            compilation of information of your organization. Promozione Branding
            Private Limited will be authorized to use this information for
            promotional purposes.
          </Text>

          <Text style={styles.termItem} wrap>
            7) Refund of any amount is at the sole discretion of the company.
          </Text>

          <Text style={styles.termItem} wrap>
            8) Promozione Branding Private Limited may have an option to convert
            your service to an annual service plan. If unable to pay the
            outstanding amount, you may need to discontinue the service plan.
          </Text>

          <Text style={styles.termItem} wrap>
            9) Promozione Branding Private Limited reserves the right to
            add/modify/discontinue features offered with a service.
          </Text>

          <Text style={styles.termItem} wrap>
            10) To ensure excellent customer service, your calls may be
            monitored or recorded.
          </Text>

          <Text style={styles.termItem} wrap>
            11) Any discounts offered are subject to continuation of service for
            the subscribed period. Early discontinuation will lead to charges as
            per applicable rates.
          </Text>

          <Text style={styles.termItem} wrap>
            12) By accepting this document, you agree to these terms and to the
            Terms & Conditions of Use located at:
            https://promozionebranding.com/terms/
          </Text>
        </View>
      </Page> */}
    </Document>
  );
};

export default ProposalPdfTemplate;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  page: {
    paddingLeft: 30,
    paddingRight: 30,
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
    padding: 10,
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
    margin: 10,
    color: "#222",
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
    width: "70%",
    textAlign: "right",
    fontSize: 8,
  },

  termsBox: {
    marginTop: 14,
    fontSize: 8,
    lineHeight: 1.5,
  },

  notesBox: {
    // marginTop: 2,
    paddingTop: 5,
  },

  noteText: {
    fontSize: 8.5,
  },

  /* ---------------- PAGE 2 ---------------- */

  leftHeader2: {
    width: 130,
    justifyContent: "flex-start",
  },

  logoSmall: {
    width: 80,
    height: 80,
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
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 10,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#333",

    color: "#fff",
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
    width: "90%",

    gap: 15,
  },

  deliverableColumn: {
    width: "40%",
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#d3cece",
    justifyContent: "flex-start",
  },

  deliverableTitle: {
    width: "40%",
    fontWeight: "bold",

    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  deliverableList: {
    width: "100%", // width for bullet points
    padding: 2,
  },
  deliverableContent: {
    // marginBottom: 1,
    fontSize: 15,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    backgroundColor: "#5C5959",
    color: "#fff",
    padding: 5,
  },

  deliverableBox: {
    marginLeft: 6,
    marginTop: 4,
  },

  deliverableTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },

  deliverableContent: {
    fontSize: 9,

    lineHeight: 1.4,
  },

  maintermhead: {
    marginBottom: 130,
    marginTop: 10,
  },

  termsHeaderBox: {
    backgroundColor: "#e0e0e0",
    padding: 6,
    marginBottom: 10,
    marginTop: 20,
  },

  termsHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },

  termsList: {
    paddingHorizontal: 4,
  },

  termItem: {
    fontSize: 7,
    marginBottom: 6,
    lineHeight: 1.1,
    textAlign: "justify",
    color: "#696969",
  },

  // for the service in the pdf of google search

  sectionBoxForGoogleAds: {
    // marginTop: 60,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // fooetr

  footer: {
    borderTop: 1,
    marginTop: 18,

    padding: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 10,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  line: {
    width: 120,
    height: 1,
    backgroundColor: "#000",
    marginRight: 10,
  },

  email: {
    color: "#2a5db0",
    textDecoration: "underline",
    marginRight: 10,
  },

  diamondGroup: {
    flexDirection: "row",
    marginHorizontal: 10,
  },

  diamond: {
    width: 6,
    height: 6,
    backgroundColor: "#000",
    marginHorizontal: 2,
    transform: "rotate(45deg)",
  },

  phone: {
    fontSize: 10,
  },
});
