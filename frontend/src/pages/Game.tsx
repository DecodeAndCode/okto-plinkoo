import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { Button } from "../components/ui";
import { baseURL } from "../utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Minus, Plus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

const data = [
  { goal: 400 },
  { goal: 300 },
  { goal: 200 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 239 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 349 },
];

export function Game() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const canvasRef = useRef<any>();
  const [betAmount, setBetAmount] = useState("0.0000");
  const [risk, setRisk] = useState("medium");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tempBetAmount, setTempBetAmount] = useState("0.0000");
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [payout, setPayout] = useState<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement
      );
      ballManager.onBallLanded = handleBallLanded;
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  const handleBet = async () => {
    const response = await axios.post(`${baseURL}/game`, {
      betAmount,
      risk,
    });
    if (ballManager) {
      ballManager.addBall(response.data.point);
    }
  };

  const handleGoalChange = (adjustment: number) => {
    setTempBetAmount((prev) => {
      let newAmount = parseFloat(prev) + adjustment;
      if (newAmount < 0) newAmount = 0;
      return newAmount.toFixed(4);
    });
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempBetAmount(e.target.value);
  };

  const handleSubmit = () => {
    setBetAmount(tempBetAmount);
    setDrawerOpen(false);
  };

  const handleCancel = () => {
    setTempBetAmount(betAmount);
    setDrawerOpen(false);
  };

  const handleBallLanded = (bucketIndex: number) => {
    const multipliers = [1.5, 2.0, 2.5]; // Example multipliers for different buckets
    const selectedMultiplier = multipliers[bucketIndex % multipliers.length];
    setMultiplier(selectedMultiplier);
    setPayout(parseFloat(betAmount) * selectedMultiplier);
  };

  return (
    <div className="game-container">
      <div className="game-card">
        <canvas ref={canvasRef} width="800" height="800" className="game-canvas"></canvas>
        <div className="controls">
          <div className="control-item">
            <label htmlFor="betAmount" className="control-label">Bet Amount</label>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" onClick={() => setDrawerOpen(true)}>{betAmount}</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Set Bet Amount</DrawerTitle>
                    <DrawerDescription>Adjust your bet amount.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => handleGoalChange(-0.0001)}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <input
                        type="text"
                        value={tempBetAmount}
                        onChange={handleManualChange}
                        className="text-center text-2xl w-24 bg-gray-800 text-white border border-gray-600 rounded"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => handleGoalChange(0.0001)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                    <div className="mt-3 h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <Bar
                            dataKey="goal"
                            fill="#FFF"
                            style={{ opacity: 0.9 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button onClick={handleSubmit}>Submit</Button>
                    <DrawerClose asChild>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="control-item">
            <label htmlFor="risk" className="control-label">Risk</label>
            <select
              id="risk"
              className="control-input"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button
            className="control-button"
            onClick={handleBet}
          >
            Bet
          </Button>
        </div>
        {payout !== null && (
          <div className="payout-section">
            <h2>Payout</h2>
            <p>Multiplier: {multiplier}x</p>
            <p>Payout Amount: {payout.toFixed(4)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
