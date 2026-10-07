import React from 'react';

export const DocumentationTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Platform Documentation & Scoring Methodology</h2>
        <p className="text-slate-600 text-sm md:text-base">Understand how FortressAssure calculates risk, maturity, and translates findings into actionable assurance ratings.</p>
      </div>
      
      <div className="p-4 md:p-8 space-y-8 md:space-y-12">
        {/* Section 1: Assurance Ratings */}
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
            Assurance Ratings
          </h3>
          <p className="text-slate-600 mb-6 max-w-3xl leading-relaxed">
            The overall Assurance Rating is derived directly from the aggregated Maturity Score across all in-scope modules. It provides an executive-friendly grade of the application or solution's security posture, inspired by financial credit ratings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-xl bg-slate-50 border-emerald-100">
              <div className="text-2xl font-black text-emerald-500 mb-1">AAA</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 95 - 100</div>
              <p className="text-sm text-slate-600">Exceptional security posture. Controls are fully optimized, automated, and operating effectively. Negligible residual risk.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-emerald-100">
              <div className="text-2xl font-black text-emerald-500 mb-1">AA</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 90 - 94</div>
              <p className="text-sm text-slate-600">Very strong security posture. Minor process deviations may exist, but core preventative and detective controls are solid.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-emerald-100">
              <div className="text-2xl font-black text-emerald-500 mb-1">A</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 85 - 89</div>
              <p className="text-sm text-slate-600">Strong security posture. Good baseline compliance, but some areas require hardening or maturity improvement.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-amber-100">
              <div className="text-2xl font-black text-amber-500 mb-1">BBB</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 80 - 84</div>
              <p className="text-sm text-slate-600">Adequate posture. Met fundamental requirements, but susceptible to advanced threats due to missing defense-in-depth layers.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-amber-100">
              <div className="text-2xl font-black text-amber-500 mb-1">BB</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 70 - 79</div>
              <p className="text-sm text-slate-600">Marginal posture. Contains several moderate vulnerabilities or control gaps that elevate the probability of compromise.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-rose-100">
              <div className="text-2xl font-black text-rose-500 mb-1">B</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 60 - 69</div>
              <p className="text-sm text-slate-600">Weak posture. High risk of compromise. Significant control deficiencies exist in critical modules.</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 border-rose-100">
              <div className="text-2xl font-black text-rose-600 mb-1">C</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score: 0 - 59</div>
              <p className="text-sm text-slate-600">Unacceptable posture. Complete breakdown or absence of security controls. Immediate remediation or isolation required.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Module Maturity Scoring Algorithm */}
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</span>
            Scoring Algorithm
          </h3>
          <p className="text-slate-600 mb-4 max-w-3xl leading-relaxed">
            Each security module begins with a baseline score of <strong>100</strong>. When findings are identified within a module, points are deducted based on a weighted penalty system.
          </p>
          
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Finding Severity</th>
                  <th className="px-6 py-4">Base Penalty</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-rose-600">CRITICAL</td>
                  <td className="px-6 py-4 font-mono font-medium">-30 Points</td>
                  <td className="px-6 py-4 text-slate-600">Immediate exploitable risk leading to system compromise or data breach.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-orange-500">HIGH</td>
                  <td className="px-6 py-4 font-mono font-medium">-15 Points</td>
                  <td className="px-6 py-4 text-slate-600">Significant vulnerability; difficult to exploit or partially mitigated.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-amber-500">MEDIUM</td>
                  <td className="px-6 py-4 font-mono font-medium">-5 Points</td>
                  <td className="px-6 py-4 text-slate-600">Missing defense-in-depth control; limited direct impact.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-blue-500">LOW</td>
                  <td className="px-6 py-4 font-mono font-medium">-1 Point</td>
                  <td className="px-6 py-4 text-slate-600">Informational or best-practice deviation.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <h4 className="font-bold text-amber-900 mb-1">Asset Criticality Multipliers</h4>
            <p className="text-sm text-amber-800 leading-relaxed max-w-4xl">
              The base penalty is multiplied by an <strong>Asset Criticality Factor</strong>. 
              If the assessed system contains Highly Critical assets (Crown Jewels), all penalties are multiplied by <strong>1.5x</strong>. 
              If the system has Low Criticality, penalties are reduced by <strong>0.7x</strong>. 
              Furthermore, if the assessment type is a <em>Security Solution</em>, foundational modules like Architecture and Identity receive an additional <strong>1.25x</strong> penalty multiplier due to the high trust nature of security products.
            </p>
          </div>
        </section>

        {/* Section 3: Assessment Process */}
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
            Assessment Workflow
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200">1</div>
              <div>
                <h4 className="font-bold text-slate-900">Scoping</h4>
                <p className="text-slate-600 text-sm mt-1">Define project boundaries, asset classifications, and structural components (servers, databases, network zones).</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200">2</div>
              <div>
                <h4 className="font-bold text-slate-900">Module Execution</h4>
                <p className="text-slate-600 text-sm mt-1">Provide configuration evidence, scan results, and topology files. The engine interprets this data to identify gaps automatically.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200">3</div>
              <div>
                <h4 className="font-bold text-slate-900">Manual Assurance</h4>
                <p className="text-slate-600 text-sm mt-1">Assessors can supplement automated findings with manual risk observations using the Findings Registry.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200">4</div>
              <div>
                <h4 className="font-bold text-slate-900">Executive Reporting</h4>
                <p className="text-slate-600 text-sm mt-1">Generate dynamic dashboards and print-ready reports that map technical debt directly to business risk and compliance frameworks (NIST, CIS, ISO).</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
