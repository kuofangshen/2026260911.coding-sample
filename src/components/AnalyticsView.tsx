import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Board, Card, RFI, User } from '../types';
import { TrendingDown, CheckCircle, Award } from 'lucide-react';

interface AnalyticsViewProps {
  board: Board;
  cards: Card[];
  rfis: RFI[];
  users: User[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  board,
  cards,
  rfis,
  users,
}) => {
  const burndownData = [
    { day: 'Day 1', ideal: 50, actual: 50 },
    { day: 'Day 2', ideal: 45, actual: 48 },
    { day: 'Day 3', ideal: 40, actual: 42 },
    { day: 'Day 4', ideal: 35, actual: 36 },
    { day: 'Day 5', ideal: 30, actual: 31 },
    { day: 'Day 6', ideal: 25, actual: 24 },
    { day: 'Day 7', ideal: 20, actual: 18 },
    { day: 'Day 8', ideal: 15, actual: 14 },
    { day: 'Day 9', ideal: 10, actual: null },
    { day: 'Day 10 (Sprint Close)', ideal: 0, actual: null },
  ];

  const rfiStatusData = [
    { name: '草稿 (DRAFT)', count: rfis.filter(r => r.status === 'draft').length },
    { name: '已提交 (SUBMITTED)', count: rfis.filter(r => r.status === 'submitted').length },
    { name: '審核中 (REVIEW)', count: rfis.filter(r => r.status === 'under_review').length },
    { name: '已答覆 (ANSWERED)', count: rfis.filter(r => r.status === 'answered').length },
    { name: '已結案 (CLOSED)', count: rfis.filter(r => r.status === 'closed').length },
  ];

  const priorityData = [
    { name: 'URGENT', label: '緊急', value: cards.filter(c => c.priority === 'urgent').length },
    { name: 'HIGH', label: '高', value: cards.filter(c => c.priority === 'high').length },
    { name: 'MEDIUM', label: '中', value: cards.filter(c => c.priority === 'medium').length },
    { name: 'LOW', label: '低', value: cards.filter(c => c.priority === 'low').length },
  ];

  const memberWorkload = users.map(u => ({
    name: u.name,
    role: u.role,
    cardsCount: cards.filter(c => c.assignees.includes(u.id)).length,
    rfisAssigned: rfis.filter(r => r.assignedTo === u.id).length
  }));

  const totalCards = cards.length;
  const completedCards = cards.filter(c => c.columnId.includes('done') || c.columnId.includes('accepted')).length;
  const cardCompletionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
  
  const totalRfis = rfis.length;
  const resolvedRfis = rfis.filter(r => r.status === 'answered' || r.status === 'closed').length;
  const rfiResolutionRate = totalRfis > 0 ? Math.round((resolvedRfis / totalRfis) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6" id="analytics-view">
      {/* Header */}
      <div className="bg-white border-2 border-black p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">
            ANALYTICS & METRICS
          </span>
          <h2 className="text-2xl font-serif font-bold text-black mt-2">
            敏捷燃盡圖與 RFI 結案效能分析
          </h2>
          <p className="text-xs font-mono text-neutral-600 mt-1">
            PROJECT: {board.title} • CYCLE: SPRINT 24 (ACTIVE)
          </p>
        </div>

        {/* Top summary KPIs */}
        <div className="flex items-center gap-6 font-mono">
          <div className="text-right">
            <span className="text-xs text-neutral-500 uppercase">看板交付率</span>
            <div className="text-3xl font-bold text-black">{cardCompletionRate}%</div>
          </div>
          <div className="h-10 w-[2px] bg-black" />
          <div className="text-right">
            <span className="text-xs text-neutral-500 uppercase">RFI 審查結案率</span>
            <div className="text-3xl font-bold text-black">{rfiResolutionRate}%</div>
          </div>
        </div>
      </div>

      {/* Grid: Burndown Chart & RFI Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sprint Burndown Chart */}
        <div className="lg:col-span-2 bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
            <div>
              <h3 className="font-serif font-bold text-black text-lg flex items-center gap-2 uppercase">
                <TrendingDown className="w-5 h-5 text-black" strokeWidth={1.5} />
                衝刺燃盡圖 (BURNDOWN CHART - SPRINT 24)
              </h3>
              <p className="text-xs font-mono text-neutral-600 mt-0.5">
                實際剩餘點數 (實線) 對比理想燃盡參考線 (虛線)
              </p>
            </div>
            <span className="text-xs font-mono border border-black bg-neutral-100 text-black px-2 py-1 font-bold">
              VELOCITY: 36 PTS
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" />
                <XAxis dataKey="day" stroke="#000" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#000" fontSize={10} fontFamily="monospace" label={{ value: 'PTS', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#000' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: '2px', borderRadius: '0px', color: '#000000', fontSize: '11px', fontFamily: 'monospace' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="ideal" 
                  name="理想燃盡 (IDEAL)" 
                  stroke="#737373" 
                  strokeDasharray="4 4" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="實際剩餘 (ACTUAL)" 
                  stroke="#000000" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#000000' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: RFI Lifecycle Distribution */}
        <div className="bg-white border-2 border-black p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-black text-lg mb-1 flex items-center gap-2 uppercase">
              <CheckCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
              RFI 狀態流轉分佈
            </h3>
            <p className="text-xs font-mono text-neutral-600 mb-4">LIFECYCLE BREAKDOWN</p>

            <div className="space-y-3 font-mono">
              {rfiStatusData.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-black">{item.name}</span>
                    <span className="text-neutral-600">{item.count} 件</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2.5 border border-black overflow-hidden">
                    <div 
                      className="h-full bg-black transition-all duration-100"
                      style={{ 
                        width: `${totalRfis > 0 ? (item.count / totalRfis) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-neutral-100 border border-black text-xs font-mono">
            <div className="font-bold text-black mb-1 uppercase">QUALITY ASSESSMENT:</div>
            <p className="text-neutral-800 font-serif leading-relaxed text-xs">
              目前無逾期未答覆之重大 RFI 單據，官方答覆均於規範 48 小時內核發確認。
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Team Workload & Task Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <div className="bg-white border-2 border-black p-6">
          <h3 className="font-serif font-bold text-black text-lg mb-1 uppercase">
            團隊成員負載分佈 (TEAM WORKLOAD)
          </h3>
          <p className="text-xs font-mono text-neutral-600 mb-4">BALANCE ALLOCATION BY ROLE</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberWorkload} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" />
                <XAxis dataKey="name" stroke="#000" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#000" fontSize={10} fontFamily="monospace" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#000000', borderWidth: '2px', borderRadius: '0px', color: '#000000', fontSize: '11px', fontFamily: 'monospace' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="cardsCount" name="看板卡片 (CARDS)" fill="#000000" />
                <Bar dataKey="rfisAssigned" name="RFI 審查 (RFIS)" fill="#737373" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white border-2 border-black p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-black text-lg mb-1 uppercase">
              卡片優先級等級分佈 (PRIORITY BREAKDOWN)
            </h3>
            <p className="text-xs font-mono text-neutral-600 mb-4">IDENTIFY CRITICAL BLOCKERS</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
              {priorityData.map(item => (
                <div key={item.name} className="p-3 bg-white border-2 border-black text-center">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">{item.name} ({item.label})</span>
                  <span className="text-2xl font-bold mt-1 block text-black">
                    {item.value} <span className="text-xs font-normal">張</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-neutral-100 border border-black text-xs space-y-2 text-neutral-800 leading-relaxed font-mono">
            <div className="flex items-center gap-1.5 font-bold text-black uppercase">
              <Award className="w-4 h-4 text-black" strokeWidth={1.5} />
              HEALTH CHECK SUMMARY
            </div>
            <p className="font-serif text-xs">
              緊急 (Urgent) 卡片已連結相應的 RFI-2026-001 答覆單，並在 HTML Studio 完成即時遙測 Widget 驗證，預計於本次 Sprint 順利交付。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
