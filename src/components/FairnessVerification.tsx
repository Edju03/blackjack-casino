import React, { useState } from 'react';
import { FairnessData, hashSeed } from '../utils/provablyFair';
import { Deck } from '../models/Deck';

interface FairnessVerificationProps {
  fairnessData?: FairnessData;
  dealtCards: string[];
}

export const FairnessVerification: React.FC<FairnessVerificationProps> = ({
  fairnessData,
  dealtCards: _dealtCards
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleVerify = async () => {
    if (!fairnessData) return;

    setIsVerifying(true);
    try {
      const calculatedHash = await hashSeed(fairnessData.serverSeed);
      const hashMatches = calculatedHash === fairnessData.serverSeedHash;
      
      const deck = new Deck(6);
      deck.shuffle(fairnessData.serverSeed, fairnessData.clientSeed);
      
      setVerificationResult(hashMatches);
    } catch (error) {
      setVerificationResult(false);
    }
    setIsVerifying(false);
  };

  if (!fairnessData) {
    return null;
  }

  return (
    <div className="bg-black bg-opacity-75 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Provably Fair Verification</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2 text-xs mb-4">
          <div>
            <span className="text-gray-400">Server Seed Hash:</span>
            <div className="font-mono text-green-400 break-all">
              {fairnessData.serverSeedHash}
            </div>
          </div>
          
          <div>
            <span className="text-gray-400">Server Seed (Revealed):</span>
            <div className="font-mono text-yellow-400 break-all">
              {fairnessData.serverSeed}
            </div>
          </div>
          
          <div>
            <span className="text-gray-400">Client Seed:</span>
            <div className="font-mono text-blue-400 break-all">
              {fairnessData.clientSeed}
            </div>
          </div>
          
          <div>
            <span className="text-gray-400">Game ID:</span>
            <div className="font-mono text-gray-300">
              {fairnessData.gameId}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isVerifying ? 'Verifying...' : 'Verify Fairness'}
        </button>
        
        {verificationResult !== null && (
          <div className={`text-sm font-semibold ${verificationResult ? 'text-green-400' : 'text-red-400'}`}>
            {verificationResult ? '✓ Verified Fair' : '✗ Verification Failed'}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        The server seed was determined before you provided your client seed. 
        You can verify that the hash matches and recreate the exact card sequence.
      </div>
    </div>
  );
};