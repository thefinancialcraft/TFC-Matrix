import { CheckCircle2 } from 'lucide-react'

export default function TopPerformers({ performers }: { performers: any[] }) {
  return (
    <div className="bg-card border border-borderDark rounded-xl p-5 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-white">Top Performers</h3>
        <span className="text-[#8B949E]"><CheckCircle2 size={16} /></span>
      </div>
      
      <div className="space-y-4">
        {performers.map((p, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-borderDark flex items-center justify-center text-xs font-semibold text-white">
                {p.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name}</h4>
                <p className="text-xs text-[#8B949E]">{p.month}</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-500">
              {p.percent}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
