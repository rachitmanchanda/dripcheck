'use client'

import React, { useState, useEffect } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { WhatsappIcon } from "react-share";
import { RefreshCw } from 'lucide-react';

interface OutfitItem {
  'product link': string;
  'apparel name': string;
  'apparel image': string;
  'item-price': number;
  type: string;
  brand: string;
}

interface SelectedOutfit {
  [key: string]: OutfitItem;
}

export function CompactOutfitRouletteWithBudgetComponent() {
  const [outfitItems, setOutfitItems] = useState<Record<string, OutfitItem[]> | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<SelectedOutfit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(10000);
  const [copyNotification, setCopyNotification] = useState('');

  useEffect(() => {
    fetchOutfitItems();
  }, []);

  const fetchOutfitItems = async () => {
    try {
      const response = await fetch('/api/outfitItems');
      if (!response.ok) {
        throw new Error('Failed to fetch outfit items');
      }
      const data = await response.json();
      setOutfitItems(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching outfit items:', err);
      setError('Failed to load outfit items. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBudgetChange = (value: number) => {
    setBudget(value);
    setSelectedOutfit(null);
  };

  const randomizeApparel = (category: string) => {
    if (!outfitItems || !outfitItems[category]) return;

    const itemsWithinBudget = outfitItems[category].filter((item: OutfitItem) => item['item-price'] <= budget);
    if (itemsWithinBudget.length === 0) return;

    const randomItem = itemsWithinBudget[Math.floor(Math.random() * itemsWithinBudget.length)];
    setSelectedOutfit((prev: SelectedOutfit | null) => ({
      ...prev,
      [category]: randomItem
    }));
  };

  const randomizeOutfit = () => {
    if (!outfitItems) return;
    const newOutfit: SelectedOutfit = {};
    let totalPrice = 0;

    ['headgear', 'upper', 'lower', 'footwear'].forEach(category => {
      const itemsWithinBudget = outfitItems[category].filter((item: OutfitItem) => item['item-price'] <= (budget - totalPrice));
      if (itemsWithinBudget.length > 0) {
        const randomItem = itemsWithinBudget[Math.floor(Math.random() * itemsWithinBudget.length)];
        newOutfit[category] = randomItem;
        totalPrice += Math.round(randomItem['item-price']);
      }
    });

    setSelectedOutfit(newOutfit);
  };

  useEffect(() => {
    if (outfitItems && !selectedOutfit) {
      randomizeOutfit();
    }
  }, [outfitItems, selectedOutfit, randomizeOutfit]);

  const shareOnWhatsApp = () => {
    if (!selectedOutfit) return;

    const outfitText = Object.entries(selectedOutfit)
      .map(([category, item]: [string, OutfitItem]) => 
        `${category}: ${item['apparel name']} - ₹${item['item-price'].toLocaleString()}\n` +
        `Product Link: ${item['product link']}`
      )
      .join('\n\n');
    const totalPrice = Object.values(selectedOutfit).reduce((sum: number, item: OutfitItem) => sum + item['item-price'], 0);
    const message = `Check out my outfit from Dripcheck by Dripstreet!\n\n${outfitText}\n\nTotal: ₹${totalPrice.toLocaleString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      setCopyNotification('Copied to clipboard!');
      setTimeout(() => setCopyNotification(''), 3000);
    }).catch(err => {
      console.error('Failed to copy message: ', err);
      setCopyNotification('Failed to copy');
      setTimeout(() => setCopyNotification(''), 3000);
    });

    // Open WhatsApp share link
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!outfitItems) return <div>No data</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 mb-2">Budget</p>
          <Slider
            min={1000}
            max={50000}
            step={1000}
            value={[budget]}
            onValueChange={(value) => handleBudgetChange(value[0])}
          />
          <p className="text-sm text-gray-500 mt-2">Under ₹{budget.toLocaleString()}</p>
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {['headgear', 'upper', 'lower', 'footwear'].map((category) => (
              <div key={category} className="bg-gray-100 rounded-lg overflow-hidden aspect-square w-full relative group">
                {selectedOutfit && selectedOutfit[category] ? (
                  <>
                    <Image
                      src={selectedOutfit[category]['apparel image']}
                      alt={selectedOutfit[category]['apparel name']}
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-full"
                    />
                    <button
                      onClick={() => randomizeApparel(category)}
                      className="absolute top-0 right-0 p-2 bg-white bg-opacity-70 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-bl-lg"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                      {category}: ₹{selectedOutfit[category]['item-price'].toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm font-medium text-gray-400">{category}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mb-2">
            <Button 
              onClick={randomizeOutfit} 
              className="flex-1 bg-black text-white hover:bg-gray-800 py-2 sm:py-3 text-sm sm:text-base"
            >
              Randomize All
            </Button>
            <Button
              onClick={shareOnWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4"
              disabled={!selectedOutfit}
            >
              <WhatsappIcon size={24} round />
            </Button>
          </div>
          {copyNotification && (
            <p className="text-sm text-green-600 mt-2 text-center">{copyNotification}</p>
          )}
          <p className="text-xs sm:text-sm text-center text-gray-500 mt-2">Press space to randomize</p>
        </div>
        {/* Selected Outfit section */}
        {selectedOutfit && (
          <div className="mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Selected Outfit:</h2>
            {Object.entries(selectedOutfit).map(([category, item]: [string, OutfitItem]) => (
              <div key={category} className="flex items-center mb-2">
                <a 
                  href={item['product link']} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm sm:text-base underline cursor-pointer">
                    {item['apparel name']}
                  </span>
                </a>
                <span className="ml-auto text-sm sm:text-base">
                  ₹{Math.round(item['item-price']).toLocaleString()}
                </span>
              </div>
            ))}
            <p className="font-bold mt-2 text-base sm:text-lg">
              Total: ₹{Math.round(Object.values(selectedOutfit).reduce((sum: number, item: OutfitItem) => sum + item['item-price'], 0)).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
