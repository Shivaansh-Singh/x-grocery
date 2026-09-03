"use client";

import Link from "next/link";
import { RushDLogo } from "@/components/ui/RushDLogo";

export default function TermsAndConditionsPage() {
  return (
    <div className="space-y-6 pt-4 pb-12 max-w-3xl mx-auto text-[#111111]">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <Link
          href="/profile"
          className="text-xs font-bold text-[#666666] hover:text-[#111111] transition-colors inline-flex items-center gap-1"
        >
          ← Back to Account
        </Link>
        <div className="flex items-center gap-3 pt-1">
          <RushDLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-[#666666] font-medium">
              RushD Instant Grocery Delivery Platform
            </p>
          </div>
        </div>
        <div className="text-[11px] text-[#666666] font-bold border-b border-[#E5E5E5] pb-3 pt-1">
          Last updated: September 3, 2026 • Effective Date: September 3, 2026
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 sm:p-7 space-y-6 text-xs text-[#333333] leading-relaxed shadow-xs">
        
        {/* Notice Banner */}
        <div className="bg-[#F5F5F5] border border-[#111111] p-3.5 rounded-md text-[11px] font-medium text-[#111111] space-y-1">
          <p className="font-extrabold uppercase tracking-wide text-[10px]">
            Important Consumer Notice
          </p>
          <p>
            Please read these Terms &amp; Conditions carefully before accessing or using the RushD application, website, or associated delivery services. These Terms constitute a binding agreement between you and <strong>[LEGAL ENTITY NAME]</strong> under the laws of India.
          </p>
        </div>

        {/* 1. Introduction & Acceptance */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">1. Introduction and Acceptance of Terms</h2>
          <p>
            Welcome to RushD (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by <strong>[LEGAL ENTITY NAME]</strong> having its principal office at <strong>[REGISTERED ADDRESS]</strong>. By creating an account, browsing products, or placing an order through RushD, you (&quot;User&quot;, &quot;Customer&quot;, or &quot;you&quot;) agree to be legally bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree with any part of these Terms, you must refrain from using the Platform.
          </p>
        </section>

        {/* 2. Eligibility */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">2. Eligibility to Use RushD</h2>
          <p>
            You must be at least 18 years of age and fully competent to enter into binding legal contracts under the Indian Contract Act, 1872. If you are under 18, you may use the Platform only under the supervision and with the consent of a parent or legal guardian who agrees to be bound by these Terms.
          </p>
        </section>

        {/* 3. Account Registration & Security */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">3. Account Registration and Account Security</h2>
          <p>
            To access certain features, you must register an account by providing accurate, complete, and updated information (including full name, phone number, and delivery address). You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to immediately notify RushD of any unauthorized access or security breach.
          </p>
        </section>

        {/* 4. Customer Responsibilities */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">4. Customer Responsibilities</h2>
          <p>
            You agree to: (a) provide truthful and complete information; (b) ensure a designated person is present at the delivery location during delivery; (c) verify the order items upon handover; (d) treat delivery personnel with courtesy and respect; and (e) refrain from using the Platform for fraudulent, unlawful, or abusive purposes.
          </p>
        </section>

        {/* 5. Nature of Marketplace / Delivery Service */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">5. Nature of RushD&apos;s Marketplace and Delivery Service</h2>
          <p>
            RushD operates a hyperlocal instant grocery and daily essentials delivery platform. We facilitate the ordering, localized packing, and fast doorstep delivery of groceries, fresh produce, snacks, and FMCG products from partner fulfillment hubs directly to designated service areas in India.
          </p>
        </section>

        {/* 6. Product Listings & Information */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">6. Product Listings and Product Information</h2>
          <p>
            We endeavor to display product descriptions, images, net weights, nutritional info, ingredients, and MRP accurately. However, actual product packaging, brand labeling, and formulation may vary slightly from manufacturer updates. Customers are advised to review the manufacturer packaging labels before consumption.
          </p>
        </section>

        {/* 7. Product Availability & Stock */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">7. Product Availability and Stock</h2>
          <p>
            All orders are subject to real-time stock availability. In the rare event that an item becomes unavailable after order placement due to concurrent orders or physical inventory discrepancy, we will notify you and promptly refund or adjust the item amount.
          </p>
        </section>

        {/* 8. Pricing & Taxes */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">8. Pricing and Taxes</h2>
          <p>
            All prices listed on the Platform are in Indian Rupees (₹ INR) and are inclusive of applicable Goods and Services Tax (GST), unless expressly stated otherwise. Prices are subject to change without prior notice, but price changes will not affect orders that have already been placed and accepted.
          </p>
        </section>

        {/* 9. Delivery Charges */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">9. Delivery Charges</h2>
          <p>
            Delivery charges are calculated based on the order merchandise subtotal:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            <li><strong>Subtotal below ₹200:</strong> Standard delivery charge of <strong>₹20</strong> applies.</li>
            <li><strong>Subtotal of ₹200 or above:</strong> <strong>FREE Delivery (₹0)</strong> is unlocked.</li>
          </ul>
          <p>
            Any applicable delivery charge is clearly displayed on the cart and checkout pages prior to order confirmation.
          </p>
        </section>

        {/* 10. Platform & Packaging Fees */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">10. Platform &amp; Packaging Fees</h2>
          <p>
            A nominal <strong>Platform &amp; Packaging Fee of ₹2</strong> is applied to every non-empty order to maintain hygienic packaging standards, secure bagging, and platform operational reliability.
          </p>
        </section>

        {/* 11. Order Placement */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">11. Order Placement</h2>
          <p>
            When you place an order, you make an offer to purchase the selected items at the displayed prices. Order placement requires selecting a verified delivery address and a supported payment method.
          </p>
        </section>

        {/* 12. Order Acceptance / Rejection */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">12. Order Acceptance and Rejection</h2>
          <p>
            RushD reserves the right to accept or decline any order for legitimate business reasons, including but not limited to inventory unavailability, unserviceable delivery locations, extreme weather disruptions, or suspected fraud. If an order is rejected, you will be notified and no charges will be retained.
          </p>
        </section>

        {/* 13. Order Modification */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">13. Order Modification</h2>
          <p>
            Due to our instant 10–15 minute packing and dispatch cycle, orders cannot be modified once they transition to the preparation or dispatch stage. If you require additional items, please place a new order.
          </p>
        </section>

        {/* 14. Order Cancellation */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">14. Order Cancellation</h2>
          <p>
            You may cancel an order free of charge while its status is <strong>PENDING</strong>. Once an order has been accepted and packing has commenced, cancellations may incur a cancellation fee equivalent to the packaging and operational costs incurred.
          </p>
        </section>

        {/* 15. Delivery Timelines & Delays */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">15. Delivery Timelines and Delays</h2>
          <p>
            While RushD targets delivery within 10–15 minutes, estimated delivery times are indicative. Delivery timelines may be subject to unforeseen delays caused by adverse weather, traffic congestion, road blockages, high surge demand, or local safety restrictions.
          </p>
        </section>

        {/* 16. Failed Delivery / Customer Unavailable */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">16. Failed Delivery / Customer Unavailable</h2>
          <p>
            If our delivery partner arrives at your address and is unable to establish contact after multiple attempts (including phone calls and doorstep waiting up to 10 minutes), the order will be marked as failed. Perishable grocery items cannot be re-delivered once dispatched.
          </p>
        </section>

        {/* 17. Delivery OTP Verification */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">17. Delivery OTP Verification</h2>
          <p>
            To ensure secure, accurate, and authorized handover, RushD generates a unique 6-digit Delivery One-Time Password (OTP) for each order. You must provide this OTP to the delivery partner only upon physical receipt and inspection of your package. Providing the OTP to the rider constitutes conclusive confirmation of order handover.
          </p>
        </section>

        {/* 18. Product Substitution */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">18. Product Substitution</h2>
          <p>
            RushD does not automatically substitute ordered items without customer approval. If an item is out of stock, the customer will be refunded for that item rather than receiving unsolicited substitutes.
          </p>
        </section>

        {/* 19. Damaged, Defective, Incorrect or Missing Products */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">19. Damaged, Defective, Incorrect or Missing Products</h2>
          <p>
            If you receive any damaged item, expired product, incorrect SKU, or missing item, you must report it within <strong>24 hours</strong> of delivery through the Contact Us / Complaints section in your Account tab. Photographic evidence may be requested to expedite resolution.
          </p>
        </section>

        {/* 20. Returns */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">20. Returns</h2>
          <p>
            Due to the hygiene, freshness, and perishable nature of food and grocery products, returns are accepted strictly for verified damaged, defective, expired, or wrongly delivered items. Unopened, non-perishable general merchandise may be returned subject to verification.
          </p>
        </section>

        {/* 21. Refunds */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">21. Refunds</h2>
          <p>
            Approved refunds will be processed within <strong>3 to 5 business days</strong> to the original payment source or wallet, in accordance with applicable Reserve Bank of India (RBI) payment guidelines. For Cash on Delivery orders, refunds may be credited via direct UPI or bank transfer upon verification.
          </p>
        </section>

        {/* 22. Payment Methods */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">22. Payment Methods</h2>
          <p>
            RushD supports authorized payment methods including: (a) Cash on Delivery (COD); (b) UPI on Delivery; and (c) online prepaid payments where enabled. You agree to pay the total amount specified on the order receipt.
          </p>
        </section>

        {/* 23. Failed & Duplicate Payments */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">23. Failed and Duplicate Payments</h2>
          <p>
            In case of payment debits without order confirmation or accidental duplicate debits, the debited amount will be automatically reconciled and reversed by the acquiring bank within 5 to 7 working days.
          </p>
        </section>

        {/* 24. Promotional Offers & Coupons */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">24. Promotional Offers, Coupons and Discounts</h2>
          <p>
            All promotional discount codes, referral benefits, and promotional deals are subject to specific terms, validity windows, and minimum spend requirements. RushD reserves the right to cancel or revoke any offer utilized in a fraudulent or unauthorized manner.
          </p>
        </section>

        {/* 25. User-Generated Feedback & Photos */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">25. User-Generated Complaints, Feedback and Photos</h2>
          <p>
            When you submit feedback, complaints, product requests, or photos through our Contact Us portal, you grant RushD a non-exclusive license to use this data for order investigation, customer support, and platform quality improvements. You warrant that submitted content does not violate third-party rights or applicable laws.
          </p>
        </section>

        {/* 26 & 27. Prohibited & Fraudulent Activities */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">26. Fraudulent and Prohibited Activities</h2>
          <p>
            Users are strictly prohibited from: (a) placing fake or speculative orders; (b) attempting to reverse engineer or breach platform security; (c) sharing abusive or threatening communications with riders or staff; (d) manipulating OTP verification; or (e) utilizing automated scripts or bots to interact with the Platform.
          </p>
        </section>

        {/* 28. Suspension & Termination */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">27. Suspension and Termination of Accounts</h2>
          <p>
            RushD may immediately suspend or terminate any user account without prior notice if we detect fraudulent activity, persistent unprovoked order rejections, non-payment, or breach of these Terms.
          </p>
        </section>

        {/* 29. Intellectual Property */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">28. Intellectual Property</h2>
          <p>
            The RushD name, brand logo, software code, UI design, graphics, and domain are the exclusive proprietary property of <strong>[LEGAL ENTITY NAME]</strong>. You may not reproduce, modify, or distribute any platform assets without prior written consent.
          </p>
        </section>

        {/* 30 & 31. Privacy, Data & Cookies */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">29. Privacy, Personal Data and Cookies</h2>
          <p>
            We process your personal information (name, address, contact numbers, order history) in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian privacy regulations. Local storage and secure session cookies are utilized to manage authentication and user preferences.
          </p>
        </section>

        {/* 32. Third-Party Services */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">30. Third-Party Services and Integrations</h2>
          <p>
            Certain services (such as authentication, maps, payment gateways, and communications) are powered by trusted third-party providers. Your use of these services may be governed by their respective terms and privacy policies.
          </p>
        </section>

        {/* 33. Limitation of Liability */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">31. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable Indian law, RushD and its directors, officers, and employees shall not be liable for indirect, incidental, special, or consequential damages arising out of your use of the Platform. In all events, our aggregate liability for any direct claim shall not exceed the total amount paid by you for the specific order giving rise to the claim.
          </p>
        </section>

        {/* 34. Force Majeure */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">32. Force Majeure</h2>
          <p>
            RushD shall not be held responsible for failure or delay in performing delivery or platform obligations due to causes beyond reasonable control, including natural disasters, severe floods, pandemics, strikes, government orders, telecommunication outages, or civil disturbances.
          </p>
        </section>

        {/* 35 & 36. Consumer Rights & Disclaimers */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">33. Consumer Rights and Statutory Protections</h2>
          <p>
            Nothing in these Terms shall limit, waive, or diminish any non-waivable statutory rights available to consumers under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </section>

        {/* 37 & 38. Grievance Redressal & Customer Support */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">34. Grievance Redressal and Customer Support</h2>
          <p>
            In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Redressal details are as follows:
          </p>
          <div className="bg-[#F5F5F5] p-3 rounded border border-[#E5E5E5] space-y-1 text-[11px] font-medium">
            <p><strong>Grievance Officer:</strong> [GRIEVANCE OFFICER NAME]</p>
            <p><strong>Email:</strong> [GRIEVANCE OFFICER EMAIL]</p>
            <p><strong>Customer Support Email:</strong> [CUSTOMER SUPPORT EMAIL]</p>
            <p><strong>Support Helpline:</strong> [SUPPORT PHONE NUMBER]</p>
            <p><strong>Response Timeline:</strong> Acknowledgment within 48 hours; resolution within 30 days of grievance receipt.</p>
          </div>
        </section>

        {/* 39. Changes to Terms */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">35. Changes to Terms</h2>
          <p>
            We may update or revise these Terms from time to time to reflect regulatory changes or operational enhancements. Continued use of the Platform after the posting of modified Terms constitutes your acceptance of the revisions.
          </p>
        </section>

        {/* 40 & 41. Governing Law & Dispute Resolution */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">36. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the substantive laws of India. Any dispute, claim, or controversy arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>[JURISDICTION CITY / STATE]</strong>, India.
          </p>
        </section>

        {/* 42 & 43. Severability & Entire Agreement */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">37. Severability and Entire Agreement</h2>
          <p>
            If any provision of these Terms is determined to be unlawful or unenforceable, such provision shall be severed without affecting the validity and enforceability of the remaining provisions. These Terms constitute the entire agreement between you and RushD regarding platform usage.
          </p>
        </section>

        {/* 44. Contact Information */}
        <section className="space-y-1.5">
          <h2 className="text-sm font-extrabold text-[#111111]">38. Contact Information</h2>
          <p>
            For questions, feedback, or assistance, please contact us via the <strong>Contact Us</strong> section in your Account or reach out to:
          </p>
          <div className="bg-[#F5F5F5] p-3 rounded border border-[#E5E5E5] space-y-0.5 text-[11px] font-medium">
            <p><strong>RushD Support Desk:</strong> [CUSTOMER SUPPORT EMAIL]</p>
            <p><strong>Registered Address:</strong> [REGISTERED ADDRESS]</p>
          </div>
        </section>
      </div>

      {/* Footer Return Link */}
      <div className="text-center pt-2">
        <Link
          href="/profile"
          className="inline-block px-5 py-2.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs rounded border border-[#111111] transition-colors"
        >
          ← Return to Account
        </Link>
      </div>
    </div>
  );
}
