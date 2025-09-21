import React from 'react';

interface ActionButtonsProps {
  availableActions: string[];
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onInsurance: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  availableActions,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={onHit}
        disabled={disabled || !availableActions.includes('hit')}
        className="btn-action btn-hit"
      >
        Hit
      </button>
      
      <button
        onClick={onStand}
        disabled={disabled || !availableActions.includes('stand')}
        className="btn-action btn-stand"
      >
        Stand
      </button>
      
      {availableActions.includes('double') && (
        <button
          onClick={onDouble}
          disabled={disabled}
          className="btn-action btn-double"
        >
          Double
        </button>
      )}
      
      {availableActions.includes('split') && (
        <button
          onClick={onSplit}
          disabled={disabled}
          className="btn-action btn-split"
        >
          Split
        </button>
      )}
      
      {availableActions.includes('surrender') && (
        <button
          onClick={onSurrender}
          disabled={disabled}
          className="btn-action btn-surrender"
        >
          Surrender
        </button>
      )}
      
      {availableActions.includes('insurance') && (
        <button
          onClick={onInsurance}
          disabled={disabled}
          className="btn-action btn-insurance"
        >
          Insurance
        </button>
      )}
    </div>
  );
};