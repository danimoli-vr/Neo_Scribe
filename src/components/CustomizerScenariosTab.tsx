import React from 'react';
import { Info, Building2, Check, Wand2 } from 'lucide-react';
import { WORLDBUILDING_SCENARIOS, MODULE_ICON_MAP } from '../services/moduleConfigService';

interface CustomizerScenariosTabProps {
  appliedScenarioId: string | null;
  onApplyScenario: (scenarioId: string) => void;
}

export const CustomizerScenariosTab: React.FC<CustomizerScenariosTabProps> = ({
  appliedScenarioId,
  onApplyScenario
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-white">¿Tu historia transcurre en una sola ciudad, en un reino feudal o en un búnker subterráneo?</strong>
          </p>
          <p className="text-slate-400 text-[11px]">
            Aplica una plantilla con un solo clic. Por ejemplo, en <strong className="text-cyan-300">Metrópolis Cyberpunk</strong> el Atlas se convierte en "Distritos de la Metrópolis" con icono de rascacielos, las Facciones en "Megacorporaciones & Cárteles" y el Sustrato en "Arquitectura de Red & Ciberware". Después podrás retocar cada nombre como prefieras.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORLDBUILDING_SCENARIOS.map((sc) => {
          const isJustApplied = appliedScenarioId === sc.id;
          const IconComp = MODULE_ICON_MAP[sc.icon] || Building2;

          return (
            <div
              key={sc.id}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                isJustApplied 
                  ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'border-[#1e293b] bg-[#0e121a] hover:border-cyan-500/60 hover:bg-[#121624]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs tracking-wide">
                        {sc.name}
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {sc.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {sc.description}
                </p>

                {/* Quick preview of changes */}
                <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">Atlas:</span>
                    <span className="text-cyan-300 font-bold truncate max-w-[170px] text-right">
                      {sc.modules.atlas?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">Facciones:</span>
                    <span className="text-purple-300 font-bold truncate max-w-[170px] text-right">
                      {sc.modules.factions?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">Sustrato/Leyes:</span>
                    <span className="text-emerald-300 font-bold truncate max-w-[170px] text-right">
                      {sc.modules.architecture?.title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-800/60">
                <button
                  onClick={() => onApplyScenario(sc.id)}
                  className={`w-full py-2 px-3 rounded flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                    isJustApplied
                      ? 'bg-emerald-600 text-black shadow-lg'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300'
                  }`}
                >
                  {isJustApplied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Aplicado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Aplicar Este Escenario</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
