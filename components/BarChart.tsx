'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function BarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
          barSize={12}
        >
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F242F" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8B949E', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8B949E', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#1F242F' }}
            contentStyle={{ backgroundColor: '#151921', border: '1px solid #1F242F', borderRadius: '8px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#8B949E', paddingBottom: '20px' }}
          />
          <Bar dataKey="target" name="Target" fill="#2D333F" radius={[4, 4, 0, 0]} />
          <Bar dataKey="score" name="Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
