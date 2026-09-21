export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  badge, 
  badgeColor,
  icon
}: { 
  title: string
  value: string
  subtitle: string
  badge: string
  badgeColor: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-card border border-borderDark rounded-xl p-5 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
          {badge}
        </span>
        <span className="text-[#8B949E]">{icon}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white leading-none mb-1">{value}</h3>
        <p className="text-[13px] text-[#8B949E]">{subtitle}</p>
      </div>
    </div>
  )
}
