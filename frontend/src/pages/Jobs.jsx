import React from 'react'
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import JobTable from '../components/JobTable'
import RelatedLinks from '../components/RelatedLinks'

export default function Jobs() {
  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>QA, SDET & Test Automation Jobs | Route2Hire</title>
        <meta
          name="description"
          content="Browse latest QA, SDET, Test Automation, and Software Testing jobs on Route2Hire. Find curated opportunities from top companies for Quality Assurance and Test Engineering professionals."
        />
        <meta
          name="keywords"
          content="QA jobs, SDET careers, Test Automation jobs, Software Testing positions, Quality Assurance roles, Test Engineering jobs, QA engineer positions, Automation testing careers"
        />
        <meta property="og:title" content="QA, SDET & Test Automation Jobs | Route2Hire" />
        <meta
          property="og:description"
          content="Discover the latest QA, SDET, and Test Automation job opportunities. Browse curated software testing positions from top companies on Route2Hire platform."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/jobs" />
        <meta property="og:image" content="https://route2hire.com/logo.png" />
        <link rel="canonical" href="https://route2hire.com/jobs" />
      </Helmet>

      <div>
      {/* Job Table Section */}
      <section id="jobs" className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Breadcrumb Navigation */}
            <div className="mb-8 pt-20">
              <Breadcrumb 
                items={[
                  { label: 'Jobs', path: '/jobs' }
                ]}
              />
            </div>
            
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Premium Opportunities</h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                Discover hand-curated, high-paying positions from top companies worldwide
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              <JobTable />
            </div>
            
            {/* Related Resources Section */}
            <div className="mt-12">
              <RelatedLinks type="job" />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
