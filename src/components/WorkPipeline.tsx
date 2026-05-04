import React from 'react';

interface ProjectStage {
  name: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
}

interface ProjectPipelineProps {
  projectName: string;
  stages: ProjectStage[];
}

const WorkPipeline: React.FC<ProjectPipelineProps> = ({ projectName, stages }) => {
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary-container/30">
            <span className="material-symbols-outlined text-primary-container">alt_route</span>
          </div>
          <div>
            <h4 className="text-white font-outfit font-bold">{projectName}</h4>
            <p className="text-outline text-xs font-space uppercase tracking-widest">Pipeline de Trabajo / Seguimiento Real</p>
          </div>
        </div>
        <span className="text-[10px] font-space font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-white">SYNC: LIVE</span>
      </div>

      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-0">
          <div 
            className="h-full bg-gradient-to-r from-primary-container to-secondary-container transition-all duration-1000" 
            style={{ width: `${(stages.filter(s => s.status === 'completed').length / (stages.length - 1)) * 100}%` }}
          ></div>
        </div>

        {stages.map((stage, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
              stage.status === 'completed' 
                ? 'bg-primary-container border-primary-container text-on-primary' 
                : stage.status === 'active'
                ? 'bg-bg-dark border-primary-container text-primary-container neon-border scale-110'
                : 'bg-bg-dark border-white/10 text-outline'
            }`}>
              <span className="material-symbols-outlined text-xl">{stage.icon}</span>
            </div>
            <span className={`text-[10px] font-bold font-space uppercase tracking-tighter ${
              stage.status === 'active' ? 'text-primary-container' : 'text-outline'
            }`}>
              {stage.name}
            </span>
            
            {stage.status === 'active' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-container rounded-full animate-ping"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkPipeline;
