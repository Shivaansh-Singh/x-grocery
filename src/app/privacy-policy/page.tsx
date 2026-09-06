"use client";

import Link from "next/link";
import { RushDLogo } from "@/components/ui/RushDLogo";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 pt-4 pb-16 max-w-3xl mx-auto text-[#111111] dark:text-[#F5F5F5]">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <Link
          href="/profile"
          className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white transition-colors inline-flex items-center gap-1"
        >
          ← Back to Account
        </Link>
        <div className="flex items-center gap-3 pt-1">
          <RushDLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-[#F5F5F5] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] font-medium">
              RushD Hyperlocal Grocery Delivery Service
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#666666] dark:text-[#A3A3A3] font-bold border-b border-[#E5E5E5] dark:border-[#262626] pb-3 pt-1">
          <span className="bg-[#DFFF00] text-[#000000] text-[10px] font-black px-2 py-0.5 rounded border border-[#111111]">
            ACTIVE POLICY
          </span>
          <span>Effective Date: September 7, 2026</span>
          <span>•</span>
          <span>Hyperlocal Grocery Delivery Service</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-[#141414] rounded-lg border border-[#E5E5E5] dark:border-[#262626] p-5 sm:p-7 space-y-6 text-xs text-[#333333] dark:text-[#CCCCCC] leading-relaxed shadow-xs">

        {/* Service Notice Banner */}
        <div className="bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-[#111111] dark:border-[#333333] p-4 rounded-md text-[11px] font-medium text-[#111111] dark:text-[#F5F5F5] space-y-1.5">
          <p className="font-extrabold uppercase tracking-wide text-[10px] text-[#111111] dark:text-[#DFFF00]">
            About RushD &amp; This Policy
          </p>
          <p>
            RushD is an independent hyperlocal grocery delivery service. This Privacy Policy explains how customer information is collected, stored, processed, and protected when you access or use the RushD application (&quot;Platform&quot;) and related delivery services.
          </p>
          <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">
            This policy explains how we handle customer information transparently and responsibly while providing RushD services.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            1. Information We Collect
          </h2>
          <p>
            We only collect personal information that is necessary to provide grocery delivery, authenticate user accounts, and fulfill customer support requests. The categories of information collected include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>Account &amp; Authentication Information:</strong> When you sign in with Google or create an account, we receive your name, email address, and authenticated user identifier. We never receive or store your Google password.
            </li>
            <li>
              <strong>Profile Information:</strong> Your display name, contact mobile number, and email address managed in your account profile.
            </li>
            <li>
              <strong>Delivery Address Information:</strong> Delivery address details, including flat/room number, building details, optional landmark, contact phone number, and address label (Home, Work, or Other).
            </li>
            <li>
              <strong>Order &amp; Transaction Details:</strong> Products ordered, item quantities, unit prices, applicable fees, total bill amount, payment method, order status, order notes, and delivery verification information.
            </li>
            <li>
              <strong>Customer Support &amp; Grievance Records:</strong> Messages, feedback type (Complaint, Feedback, Product Request), contact details, and optional photo attachments you upload when submitting a ticket through our Support Help Desk.
            </li>
            <li>
              <strong>Local Device Storage:</strong> Active shopping cart contents and interface theme preferences stored locally on your device.
            </li>
          </ul>
        </section>

        {/* 2. Local Browser Storage vs Server Records */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            2. Local Device Storage &amp; Cookies
          </h2>
          <p>
            RushD uses local device storage and session mechanisms strictly for operational functionality:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>Shopping Cart (Local Storage):</strong> Your cart items are saved locally on your device so that your selected groceries remain in your bag while using the Platform. This data remains stored locally on your device until you clear the cart, clear the app&apos;s local storage, or the application removes it as part of its normal operation.
            </li>
            <li>
              <strong>Essential Session Cookies:</strong> We utilize secure session mechanisms, including authentication tokens and, where applicable, HTTP cookies, strictly to verify login state and protect role-specific access.
            </li>
            <li>
              <strong>No Advertising or Tracking Cookies:</strong> RushD does not deploy third-party advertising cookies, behavioral tracking scripts, or cross-site tracking beacons.
            </li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            3. How We Use Your Information
          </h2>
          <p>
            We process customer personal data exclusively for the following operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>Creating, authenticating, and maintaining your RushD account.</li>
            <li>Processing grocery orders and calculating authoritative order totals and fees.</li>
            <li>Facilitating doorstep delivery by providing your address and contact number to assigned delivery riders.</li>
            <li>Verifying doorstep delivery completion through cryptographically hashed 6-digit OTP codes.</li>
            <li>Responding to customer care inquiries, missing item reports, and feedback submitted through our Help Desk.</li>
            <li>Preventing duplicate orders, fraud, and abusive platform activity.</li>
            <li>Maintaining operational and transaction records as required for legitimate business and legal purposes.</li>
          </ul>
        </section>

        {/* 4. Google Sign-In */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            4. Google Sign-In
          </h2>
          <p>
            You may choose to sign in to RushD using your Google account. In doing so, Google authenticates your identity and shares basic profile information (such as your name and email address) with our authentication backend.
          </p>
          <p className="text-[11px]">
            RushD never accesses, requests, or stores your Google password. Your authentication tokens are validated through Supabase Auth using industry-standard OAuth 2.0 protocols.
          </p>
        </section>

        {/* 5. How Information Is Shared */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            5. How Information Is Shared
          </h2>
          <p>
            We share personal data strictly on a need-to-know operational basis:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>Assigned Delivery Partners (Riders):</strong> When an order is dispatched, the assigned rider receives your delivery address, flat/room number, contact phone number, and order items exclusively to navigate to your doorstep and complete delivery.
            </li>
            <li>
              <strong>Store Operations Staff:</strong> Store personnel access order lists and customer contact details to pack products and resolve stock discrepancies.
            </li>
            <li>
              <strong>Customer Support:</strong> Authorized staff inspect reported order issues, feedback notes, and uploaded photos to issue refunds or adjustments.
            </li>
            <li>
              <strong>Core Infrastructure Providers:</strong> Technical service providers (Supabase, Vercel) process database queries, authentication flows, and file uploads to maintain application reliability.
            </li>
          </ul>
          <p className="font-bold text-[11px] text-[#111111] dark:text-[#F5F5F5]">
            We do not sell, rent, monetize, or trade customer personal data to third parties, marketers, or data brokers.
          </p>
        </section>

        {/* 6. Service Providers */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            6. Service Providers &amp; Infrastructure
          </h2>
          <p>
            RushD relies on trusted cloud infrastructure to run reliably:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>Supabase Inc.:</strong> Provides our managed PostgreSQL database, user authentication service, and cloud storage for customer support attachments.
            </li>
            <li>
              <strong>Google LLC:</strong> Facilitates Google OAuth 2.0 single sign-on authentication.
            </li>
            <li>
              <strong>Vercel Inc.:</strong> Hosts the RushD application and executes server-side API handlers.
            </li>
          </ul>
          <p className="text-[11px]">
            These providers process information as necessary to provide the infrastructure and services used by RushD, subject to their respective terms and privacy practices.
          </p>
        </section>

        {/* 7. Data Retention */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            7. Data Retention
          </h2>
          <p>
            Personal data is retained only for as long as reasonably necessary to provide grocery delivery services, maintain your active account, handle customer support inquiries, and satisfy legitimate operational and audit requirements.
          </p>
          <p className="text-[11px]">
            Order records and transaction histories are retained to maintain accurate accounting and order dispute resolution. You may request deletion of your account and saved addresses by contacting our support team.
          </p>
        </section>

        {/* 8. Data Security Safeguards */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            8. Data Security Safeguards
          </h2>
          <p>
            We employ reasonable technical and organizational safeguards designed to protect personal information against unauthorized access, loss, or misuse:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>HTTPS/TLS encryption for data transmitted between your device and our servers.</li>
            <li>Server-side role-based access control (RBAC) separating customer, store admin, and rider permissions.</li>
            <li>Cryptographic hashing of doorstep delivery verification OTPs before database persistence.</li>
            <li>Access-controlled cloud storage for customer-uploaded support photos.</li>
            <li>Strict server-side validation ensuring users can only access their own orders and addresses.</li>
          </ul>
          <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">
            While we take diligent steps to safeguard your data, no method of transmission over the internet or electronic storage is completely infallible.
          </p>
        </section>

        {/* 9. Your Privacy Rights & Requests */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            9. Your Privacy Rights &amp; Requests
          </h2>
          <p>
            Subject to applicable Indian privacy laws, you may have rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>Access &amp; Review:</strong> You can view your personal details, order history, and saved delivery addresses anytime in your RushD profile.
            </li>
            <li>
              <strong>Correction:</strong> You can update your name and phone number in <em>Personal Details</em> or edit your delivery addresses in <em>Delivery Addresses</em>.
            </li>
            <li>
              <strong>Account / Data Deletion:</strong> You may request the deletion of your account and associated personal data by contacting our Privacy &amp; Grievance Contact.
            </li>
            <li>
              <strong>Grievance Redressal:</strong> You may raise concerns or complaints regarding the processing of your data.
            </li>
          </ul>
        </section>

        {/* 10. Privacy & Grievance Contact */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            10. Privacy &amp; Grievance Contact
          </h2>
          <p>
            If you have questions, privacy requests, or grievances regarding your personal information, you may contact the RushD support team:
          </p>

          <div className="bg-[#F5F5F5] dark:bg-[#1E1E1E] p-4 rounded-md border border-[#E5E5E5] dark:border-[#2C2C2C] space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5]">
                Privacy &amp; Grievance Contact:
              </span>
              <span className="text-xs text-[#666666] dark:text-[#A3A3A3]">
                RushD Local Operations Team
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="font-bold text-[#111111] dark:text-[#F5F5F5] block">📞 Helpline:</span>
                <a href="tel:+919244302120" className="text-[#111111] dark:text-[#DFFF00] font-bold hover:underline">
                  +91 9244302120
                </a>
                <span className="text-[10px] text-[#666666] dark:text-[#888888] block">Available 8:00 AM – 11:00 PM IST</span>
              </div>
              <div>
                <span className="font-bold text-[#111111] dark:text-[#F5F5F5] block">✉ Email:</span>
                <a href="mailto:rushd.customercare@gmail.com" className="text-[#111111] dark:text-[#DFFF00] font-bold hover:underline">
                  rushd.customercare@gmail.com
                </a>
                <span className="text-[10px] text-[#666666] dark:text-[#888888] block">Subject: Privacy / Data Request</span>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Children's Privacy */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            11. Children&apos;s Privacy
          </h2>
          <p>
            RushD is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18 without appropriate parental or legal guardian involvement. If you believe a minor has provided us with personal information, please contact us so we can review the request and take appropriate action.
          </p>
        </section>

        {/* 12. Changes to this Privacy Policy */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-[#111111] dark:text-[#F5F5F5] flex items-center gap-2">
            12. Changes to this Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes to RushD, our operational practices, or applicable legal requirements. When we make material changes, we will update the Effective Date at the top of this page. We encourage you to review this policy periodically.
          </p>
        </section>

        {/* Quick Contact Action Bar */}
        <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-[#111111] dark:text-[#F5F5F5] block">Need help with an order or privacy question?</span>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">Our customer support team is available daily.</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              href="/profile/support"
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors text-center border border-[#111111]"
            >
              Contact Support →
            </Link>
            <Link
              href="/profile"
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#F5F5F5] dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] rounded font-bold text-xs transition-colors text-center border border-[#E5E5E5] dark:border-[#333333]"
            >
              My Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
