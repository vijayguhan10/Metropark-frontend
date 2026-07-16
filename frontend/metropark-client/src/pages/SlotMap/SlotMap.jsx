import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Minus,
  Navigation,
  DollarSign,
  Clock,
} from 'lucide-react';
import { parkingLocations, floorPlans } from '../../data/mockData';
import { Button, Card, Badge } from '../../components/UI';

const location = parkingLocations[0];
const floorPlan = floorPlans[location.id];

export default function SlotMap() {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('A-3');

  const currentFloor = floorPlan.floors[selectedFloor];
  const selectedSlotData = currentFloor.slots.find(s => s.id === selectedSlot);

  const getSlotStatusClass = (status) => {
    switch (status) {
      case 'available': return 'border-2 border-dashed border-gray-300 bg-gray-50';
      case 'occupied': return 'bg-gray-200';
      case 'selected': return 'bg-primary selected-glow border-2 border-primary';
      default: return 'border-2 border-dashed border-gray-300';
    }
  };

  const getSlotIcon = (type, status) => {
    if (status === 'occupied') {
      return (
        <img
          alt="Car"
          className="h-10 opacity-40 car-shadow"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN3l2aSf2Z8eZUaIBJU7g4zrHQdOoHkteRQ6gmSgpLPEMGKaLSsSjjusQEFDKUQ8OuEmO9EgIKKT94maJVsFJ9TnsGOkC6IGu4fVXLmCanZHBhk6GuqJXy0-a3Eu8fkKX0QUv_hsXI9I0Jr-JKbAoh7V1c6mu4ysqD9rqu-eZzagOmxo2b2gywo5mXE7PeHO5bN8jQYedj_mW9gxTsJoLFt00Ld9-D_iGT92sqwxbF4SZLZQBNhpwvzv9kiqd0xYVfwVa33Vubhqzz"
        />
      );
    }
    if (status === 'selected') {
      return (
        <div className="relative p-1.5 bg-primary rounded-lg selected-glow">
          <img
            alt="Selected Car"
            className="h-10 brightness-0 invert car-shadow"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN3l2aSf2Z8eZUaIBJU7g4zrHQdOoHkteRQ6gmSgpLPEMGKaLSsSjjusQEFDKUQ8OuEmO9EgIKKT94maJVsFJ9TnsGOkC6IGu4fVXLmCanZHBhk6GuqJXy0-a3Eu8fkKX0QUv_hsXI9I0Jr-JKbAoh7V1c6mu4ysqD9rqu-eZzagOmxo2b2gywo5mXE7PeHO5bN8jQYedj_mW9gxTsJoLFt00Ld9-D_iGT92sqwxbF4SZLZQBNhpwvzv9kiqd0xYVfwVa33Vubhqzz"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header & Floor Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors">
            <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Choose Space</h1>
        </div>
        <div className="flex bg-surface-container p-1 rounded-full w-fit">
          {floorPlan.floors.map((floor, index) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(index)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFloor === index
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Area */}
      <Card variant="outlined" className="relative min-h-[500px] rounded-2xl overflow-hidden parking-grid bg-surface-container-low flex items-center justify-center p-8">
        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white border border-outline-variant rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-variant transition-colors">
            {/* <Add className="w-5 h-5 text-on-surface-variant" /> */}
          </button>
          <button className="w-10 h-10 bg-white border border-outline-variant rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-variant transition-colors">
            <Minus className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button className="w-10 h-10 bg-white border border-outline-variant rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-variant transition-colors">
            {/* <CenterFocusStrong className="w-5 h-5 text-on-surface-variant" /> */}
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400" />
            <span className="text-on-surface-variant">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-sm" />
            <span className="text-on-surface-variant">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm shadow-[0_0_8px_rgba(76,29,149,0.5)]" />
            <span className="text-primary">Selected</span>
          </div>
        </div>

        {/* Floor Plan Visualization */}
        <div className="relative w-full max-w-2xl h-full flex items-center justify-between gap-12">
          {/* Entry/Exit Labels */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">Entry</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">Exit</div>
          {/* Center Lane */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-r border-dashed border-gray-300 -translate-x-1/2" />

          {/* Left Wing (Sections A & C) */}
          <div className="flex-1 flex flex-col justify-between h-full py-10">
            {/* Section A Title */}
            <div className="absolute -left-4 top-[15%] flex items-center justify-center w-8 h-8 rounded border border-outline-variant text-xs font-bold text-gray-400">A</div>
            {/* Slot Groups */}
            <div className="space-y-12">
              {currentFloor.slots.filter(s => s.section === 'A').map((slot) => (
                <div
                  key={slot.id}
                  className={`relative h-24 w-full border-b border-dashed border-gray-200 flex items-center justify-center ${getSlotStatusClass(slot.status)}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-gray-400">{slot.id}</span>
                  {getSlotIcon(slot.type, slot.status)}
                </div>
              ))}
            </div>

            {/* Section C Title */}
            <div className="absolute -left-4 top-[70%] flex items-center justify-center w-8 h-8 rounded border border-outline-variant text-xs font-bold text-gray-400">C</div>
            <div className="space-y-12">
              {currentFloor.slots.filter(s => s.section === 'C').map((slot) => (
                <div
                  key={slot.id}
                  className={`relative h-24 w-full border-b border-dashed border-gray-200 flex items-center justify-center ${getSlotStatusClass(slot.status)}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-gray-400">{slot.id}</span>
                  {getSlotIcon(slot.type, slot.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Right Wing (Sections B & D) */}
          <div className="flex-1 flex flex-col justify-between h-full py-10">
            {/* Section B Title */}
            <div className="absolute -right-4 top-[15%] flex items-center justify-center w-8 h-8 rounded border border-outline-variant text-xs font-bold text-gray-400">B</div>
            <div className="space-y-12">
              {currentFloor.slots.filter(s => s.section === 'B').map((slot) => (
                <div
                  key={slot.id}
                  className={`relative h-24 w-full border-b border-dashed border-gray-200 flex items-center justify-center ${getSlotStatusClass(slot.status)}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 text-right">{slot.id}</span>
                  {getSlotIcon(slot.type, slot.status)}
                </div>
              ))}
            </div>

            {/* Section D Title */}
            <div className="absolute -right-4 top-[70%] flex items-center justify-center w-8 h-8 rounded border border-outline-variant text-xs font-bold text-gray-400">D</div>
            <div className="space-y-12">
              {currentFloor.slots.filter(s => s.section === 'D').map((slot) => (
                <div
                  key={slot.id}
                  className={`relative h-24 w-full border-b border-dashed border-gray-200 flex items-center justify-center ${getSlotStatusClass(slot.status)}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 text-right">{slot.id}</span>
                  {getSlotIcon(slot.type, slot.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card variant="default" className="flex items-center justify-between bg-surface-container border border-outline-variant p-6 rounded-2xl">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Selected Slot</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-on-surface">{selectedSlot}</span>
            <Badge variant="success" size="sm">LEVEL {selectedFloor + 1}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-medium text-on-surface-variant">Rate</p>
            <p className="text-lg font-bold">${location.pricePerHour.toFixed(2)}<span className="text-sm font-normal text-on-surface-variant">/hr</span></p>
          </div>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Navigation className="w-5 h-5" />}
            onClick={() => console.log('Book space', selectedSlot)}
          >
            Book Space
          </Button>
        </div>
      </Card>
    </div>
  );
}