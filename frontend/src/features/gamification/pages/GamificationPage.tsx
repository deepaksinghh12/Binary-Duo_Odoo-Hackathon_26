import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdStar, MdEco, MdNature, MdPublic } from 'react-icons/md';
import { GamificationService } from '../services/GamificationService';
import type { Challenge, ChallengeParticipation, Badge as BadgeType, Reward, LeaderboardEntry } from '../types';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import { CreateBadgeModal } from '../components/CreateBadgeModal';
import { CreateRewardModal } from '../components/CreateRewardModal';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'MdStar': return <MdStar size={24} />;
    case 'MdEco': return <MdEco size={24} />;
    case 'MdNature': return <MdNature size={24} />;
    case 'MdPublic': return <MdPublic size={24} />;
    default: return <MdStar size={24} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Draft': return 'default';
    case 'Under Review': return 'warning';
    case 'Completed': return 'info';
    case 'Archived': return 'default';
    case 'Available': return 'success';
    case 'Out of Stock': return 'danger';
    case 'Redeemed': return 'info';
    case 'Joined': return 'default';
    case 'In Progress': return 'warning';
    default: return 'default';
  }
};

export const GamificationPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeToEdit, setChallengeToEdit] = useState<Challenge | null>(null);

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeToEdit, setBadgeToEdit] = useState<BadgeType | null>(null);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardToEdit, setRewardToEdit] = useState<Reward | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  // Refs for Scroll Spy
  const chlRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const bdgRef = useRef<HTMLDivElement>(null);
  const rwdRef = useRef<HTMLDivElement>(null);
  const ldrRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [c, p, b, r, l] = await Promise.all([
          GamificationService.getChallenges(),
          GamificationService.getParticipation(),
          GamificationService.getBadges(),
          GamificationService.getRewards(),
          GamificationService.getLeaderboard(),
        ]);
        setChallenges(c); setParticipations(p); setBadges(b); setRewards(r); setLeaderboard(l);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Smooth scroll
  useEffect(() => {
    if (isLoading) return;
    setTimeout(() => {
      if (location.pathname.includes('challenges') && chlRef.current) chlRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('participation') && partRef.current) partRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('badges') && bdgRef.current) bdgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('rewards') && rwdRef.current) rwdRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('leaderboard') && ldrRef.current) ldrRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, [location.pathname, isLoading]);

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    if (type === 'challenge') setChallenges(prev => prev.filter(c => c.id !== id));
    if (type === 'badge') setBadges(prev => prev.filter(b => b.id !== id));
    if (type === 'reward') setRewards(prev => prev.filter(r => r.id !== id));
    setItemToDelete(null);
  };

  const partColumns = [
    { key: 'challengeName', header: 'Challenge' },
    { key: 'employeeName', header: 'Employee' },
    { key: 'department', header: 'Department' },
    {
      key: 'status', header: 'Status',
      render: (r: ChallengeParticipation) => (
        <Badge variant={getStatusColor(r.status) as any} className="uppercase text-[10px] tracking-wider font-bold">
          {r.status}
        </Badge>
      )
    },
    { key: 'completionDate', header: 'Completion Date', render: (r: ChallengeParticipation) => r.completionDate ? new Date(r.completionDate).toLocaleDateString() : '-' },
  ];

  const bdgColumns = [
    { 
      key: 'icon', header: 'Icon', 
      render: (r: BadgeType) => (
        <div className={`text-${r.color}-500 bg-${r.color}-50 p-2 w-fit rounded-xl`}>
          {getIconComponent(r.icon)}
        </div>
      )
    },
    { key: 'name', header: 'Badge Name', render: (r: BadgeType) => <span className="font-bold text-slate-800">{r.name}</span> },
    { key: 'description', header: 'Description', render: (r: BadgeType) => <span className="text-slate-500 text-sm">{r.description}</span> },
    { key: 'awardedCount', header: 'Awarded Count' },
    {
      key: 'actions', header: 'Actions',
      render: (r: BadgeType) => (
        <div className="flex gap-1 justify-start">
          <button onClick={() => { setBadgeToEdit(r); setIsBadgeModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#4CAF3A] hover:bg-[#4CAF3A]/10 rounded-xl transition-colors" title="Edit">
            <MdEdit size={16} />
          </button>
          <button onClick={() => setItemToDelete({ type: 'badge', id: r.id, name: r.name })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      )
    },
  ];

  const rwdColumns = [
    { key: 'name', header: 'Reward', render: (r: Reward) => <span className="font-bold text-slate-800">{r.name}</span> },
    { key: 'description', header: 'Description', render: (r: Reward) => <span className="text-slate-500 text-sm">{r.description}</span> },
    { key: 'costXP', header: 'Cost (XP)', render: (r: Reward) => <span className="font-bold text-[#4CAF3A]">{r.costXP} XP</span> },
    {
      key: 'status', header: 'Status',
      render: (r: Reward) => (
        <Badge variant={getStatusColor(r.status) as any} className="uppercase text-[10px] tracking-wider font-bold">
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions', header: 'Actions',
      render: (r: Reward) => (
        <div className="flex gap-1 justify-start">
          <button onClick={() => { setRewardToEdit(r); setIsRewardModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#4CAF3A] hover:bg-[#4CAF3A]/10 rounded-xl transition-colors" title="Edit">
            <MdEdit size={16} />
          </button>
          <button onClick={() => setItemToDelete({ type: 'reward', id: r.id, name: r.name })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      )
    },
  ];

  const ldrColumns = [
    { key: 'rank', header: 'Rank', render: (r: LeaderboardEntry) => <span className={`font-black text-lg ${r.rank <= 3 ? 'text-[#4CAF3A]' : 'text-slate-400'}`}>#{r.rank}</span> },
    { key: 'employeeName', header: 'Employee / Department', render: (r: LeaderboardEntry) => <span className="font-bold text-slate-800">{r.employeeName}</span> },
    { key: 'level', header: 'Level', render: (r: LeaderboardEntry) => <span className="text-slate-500 font-bold">Lvl {r.level}</span> },
    { key: 'totalXP', header: 'Total XP', render: (r: LeaderboardEntry) => <span className="font-bold text-[#4CAF3A]">{r.totalXP.toLocaleString()} XP</span> },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-12 max-w-[1600px]">

      {/* ── CHALLENGES ──────────────────────────────────────────────────────── */}
      <div id="challenges" ref={chlRef} className="scroll-mt-28">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Challenges</h2>
            <p className="text-sm text-slate-500 mt-1">Manage environmental and social challenges for employees.</p>
          </div>
          <Button variant="primary" className="bg-[#4CAF3A] hover:bg-[#3d8c2f] text-white" leftIcon={<MdAdd size={20} />} onClick={() => setIsChallengeModalOpen(true)}>
            New Challenge
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)
          ) : challenges.map(chl => (
            <div key={chl.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <Badge variant={getStatusColor(chl.status) as any} className="uppercase text-[9px] w-fit">{chl.status}</Badge>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{chl.difficulty}</span>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setChallengeToEdit(chl); setIsChallengeModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#4CAF3A] rounded-full">
                      <MdEdit size={16} />
                    </button>
                    <button onClick={() => setItemToDelete({ type: 'challenge', id: chl.id, name: chl.title })} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-1">{chl.title}</h3>
                <p className="text-sm font-bold text-[#4CAF3A] mb-4">{chl.xp} XP • Ends {new Date(chl.deadline).toLocaleDateString()}</p>
              </div>
              <Button variant="outline" className="w-full justify-center text-[#4CAF3A] border-[#4CAF3A]/30 hover:bg-[#4CAF3A]/10">
                Join Challenge
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── CHALLENGE PARTICIPATION ─────────────────────────────────────────── */}
      <div id="participation" ref={partRef} className="scroll-mt-28">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Challenge Participation</h2>
            <p className="text-sm text-slate-500 mt-1">Track employee progress across active challenges.</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table columns={partColumns} data={participations} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── BADGES ──────────────────────────────────────────────────────────── */}
      <div id="badges" ref={bdgRef} className="scroll-mt-28">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Badges</h2>
            <p className="text-sm text-slate-500 mt-1">Manage achievements and recognition badges.</p>
          </div>
          <Button variant="primary" className="bg-[#4CAF3A] hover:bg-[#3d8c2f] text-white" leftIcon={<MdAdd size={20} />} onClick={() => setIsBadgeModalOpen(true)}>
            New Badge
          </Button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table columns={bdgColumns} data={badges} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── REWARDS ─────────────────────────────────────────────────────────── */}
      <div id="rewards" ref={rwdRef} className="scroll-mt-28">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rewards</h2>
            <p className="text-sm text-slate-500 mt-1">Items that employees can redeem with their XP.</p>
          </div>
          <Button variant="primary" className="bg-[#4CAF3A] hover:bg-[#3d8c2f] text-white" leftIcon={<MdAdd size={20} />} onClick={() => setIsRewardModalOpen(true)}>
            New Reward
          </Button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table columns={rwdColumns} data={rewards} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── LEADERBOARD ─────────────────────────────────────────────────────── */}
      <div id="leaderboard" ref={ldrRef} className="scroll-mt-28">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Leaderboard</h2>
            <p className="text-sm text-slate-500 mt-1">Top performers and most active departments.</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table columns={ldrColumns} data={leaderboard} isLoading={isLoading} />
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <CreateChallengeModal 
        isOpen={isChallengeModalOpen || !!challengeToEdit} 
        onClose={() => { setIsChallengeModalOpen(false); setChallengeToEdit(null); }}
        initialData={challengeToEdit}
        onSubmit={(data) => {
          if (challengeToEdit) {
            setChallenges(prev => prev.map(c => c.id === challengeToEdit.id ? { ...c, ...data } as Challenge : c));
          } else {
            setChallenges(prev => [{ ...data, id: `chl-${Date.now()}` } as Challenge, ...prev]);
          }
          setIsChallengeModalOpen(false); setChallengeToEdit(null);
        }}
      />

      <CreateBadgeModal 
        isOpen={isBadgeModalOpen || !!badgeToEdit} 
        onClose={() => { setIsBadgeModalOpen(false); setBadgeToEdit(null); }}
        initialData={badgeToEdit}
        onSubmit={(data) => {
          if (badgeToEdit) {
            setBadges(prev => prev.map(b => b.id === badgeToEdit.id ? { ...b, ...data } as BadgeType : b));
          } else {
            setBadges(prev => [{ ...data, id: `bdg-${Date.now()}`, awardedCount: 0 } as BadgeType, ...prev]);
          }
          setIsBadgeModalOpen(false); setBadgeToEdit(null);
        }}
      />

      <CreateRewardModal 
        isOpen={isRewardModalOpen || !!rewardToEdit} 
        onClose={() => { setIsRewardModalOpen(false); setRewardToEdit(null); }}
        initialData={rewardToEdit}
        onSubmit={(data) => {
          if (rewardToEdit) {
            setRewards(prev => prev.map(r => r.id === rewardToEdit.id ? { ...r, ...data } as Reward : r));
          } else {
            setRewards(prev => [{ ...data, id: `rwd-${Date.now()}` } as Reward, ...prev]);
          }
          setIsRewardModalOpen(false); setRewardToEdit(null);
        }}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={() => setItemToDelete(null)}
      />

    </div>
  );
};
