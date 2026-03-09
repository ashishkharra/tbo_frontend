// components/dataset/FamilyDetailsPopup.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropUtils';
import { updateDataset } from "@/apis/api";
import 'react-easy-crop/react-easy-crop.css';

// Types - यहीं पर
interface VoterData {
  id?: number;
  family_id?: string;
  vname?: string;
  fname?: string;
  mname?: string;
  surname?: {
    f?: string;
    m?: string;
    v?: string;
  };
  sex?: string;
  age?: number;
  phone1?: string;
  phone2?: string;
  dob?: string;
  ru?: string;
  dist?: string;
  village?: string;
  gp_ward?: string;
  address?: string;
  cast_name?: string;
  cast_cat?: string;
  religion?: string;
  cast_id?: string;
  ac_no?: string;
  pc_no?: string;
  photo?: string;
  pdob_verify?: number;
  [key: string]: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPerson: VoterData | null;
  allMembers: VoterData[];
}

// यूटिलिटी फंक्शन - यहीं पर
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  } catch {
    return dateString;
  }
};

const parseDate = (dateString: string): string => {
  const patterns = [
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];

  for (const pattern of patterns) {
    const match = dateString.match(pattern);
    if (match) {
      if (pattern === patterns[2]) {
        return `${match[3]}-${match[2]}-${match[1]}`;
      } else {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
  }
  return dateString;
};

const validatePhoneNumber = (value: string): boolean => {
  const phoneRegex = /^\+?[\d]{0,15}$/;
  return phoneRegex.test(value);
};

const getGenderDisplay = (gender?: string): string => {
  if (!gender) return "-";
  if (gender === "M" || gender === "पुरुष") return "M";
  if (gender === "F" || gender === "महिला") return "F";
  return gender;
};

export const FamilyDetailsPopup: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedPerson,
  allMembers,
}) => {
  const [editedMembers, setEditedMembers] = useState<Record<string, { phone1: string; phone2: string; dob?: string; pdob_verify?: number }>>({});
  const [uploadForMember, setUploadForMember] = useState<any>(null);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [localMembers, setLocalMembers] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (isOpen && selectedPerson) {
      const members = allMembers.filter(
        (member) => member.family_id === selectedPerson.family_id
      );
      setLocalMembers(members);
    }
  }, [isOpen, selectedPerson, allMembers]);

  if (!isOpen || !selectedPerson) return null;

  const familyMembers = localMembers;

  const handlePhoneChange = (memberId: string | number | undefined, field: 'phone1' | 'phone2', value: string) => {
    if (!memberId) return;
    
    if (value && !validatePhoneNumber(value)) {
      return;
    }

    setEditedMembers(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));

    setLocalMembers(prev => 
      prev.map(member => {
        if (member.id === memberId || member.family_id === memberId) {
          return { ...member, [field]: value };
        }
        return member;
      })
    );
  };

  const handleDOBChange = (memberId: string | number | undefined, value: string) => {
    if (!memberId) return;
    
    setEditedMembers(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        dob: value
      }
    }));

    setLocalMembers(prev => 
      prev.map(member => {
        if (member.id === memberId || member.family_id === memberId) {
          return { ...member, dob: value };
        }
        return member;
      })
    );
  };

  const handleVerifyChange = (memberId: string | number | undefined, checked: boolean) => {
    if (!memberId) return;
    setEditedMembers(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        pdob_verify: checked ? 1 : 0
      }
    }));

    setLocalMembers(prev => 
      prev.map(member => {
        if (member.id === memberId || member.family_id === memberId) {
          return { ...member, pdob_verify: checked ? 1 : 0 };
        }
        return member;
      })
    );
  };

  const getPhoneValue = (member: any, field: 'phone1' | 'phone2'): string => {
    const memberId = member.id || member.family_id;
    if (memberId && editedMembers[memberId] && editedMembers[memberId][field] !== undefined) {
      return editedMembers[memberId][field];
    }
    return member[field] || "";
  };

  const getDOBValue = (member: any): string => {
    const memberId = member.id || member.family_id;
    if (memberId && editedMembers[memberId] && editedMembers[memberId].dob !== undefined) {
      return editedMembers[memberId].dob || "";
    }
    return member.dob || "";
  };

  const getVerifyValue = (member: any): boolean => {
    const memberId = member.id || member.family_id;
    if (memberId && editedMembers[memberId] && editedMembers[memberId].pdob_verify !== undefined) {
      return editedMembers[memberId].pdob_verify === 1;
    }
    return member.pdob_verify === 1;
  };

  const handleSubmit = async () => {
    const changedMembers = Object.entries(editedMembers)
      .filter(([id, changes]) => {
        const originalMember = familyMembers.find(m => 
          m.id === parseInt(id) || m.family_id === id || String(m.id) === id
        );
        return originalMember && (
          changes.phone1 !== originalMember.phone1 ||
          changes.phone2 !== originalMember.phone2 ||
          (changes.dob !== undefined && changes.dob !== originalMember.dob) ||
          (changes.pdob_verify !== undefined && changes.pdob_verify !== (originalMember.pdob_verify === 1 ? 1 : 0))
        );
      })
      .map(([id, changes]) => {
        const member = familyMembers.find(m => 
          m.id === parseInt(id) || m.family_id === id || String(m.id) === id
        );
        
        const data: any = {};
        
        if (changes.phone1 !== undefined) data.phone1 = changes.phone1;
        if (changes.phone2 !== undefined) data.phone2 = changes.phone2;
        if (changes.dob !== undefined) {
          const parsedDate = parseDate(changes.dob);
          data.dob = parsedDate;
        }
        if (changes.pdob_verify !== undefined) data.pdob_verify = changes.pdob_verify;
        
        return {
          id: member?.id || parseInt(id),
          data
        };
      });

    if (changedMembers.length === 0) {
      alert("No changes to save!");
      return;
    }

    try {
      const updatePayload = { rows: changedMembers };
      const response = await updateDataset(updatePayload);
      
      if (response.success) {
        alert(`Changes saved successfully for ${changedMembers.length} member(s)!`);
        setEditedMembers({});
        
        setLocalMembers(prev => 
          prev.map(member => {
            const change = changedMembers.find(c => c.id === member.id);
            if (change) {
              return { ...member, ...change.data };
            }
            return member;
          })
        );
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error saving changes. Please try again.");
    }
  };

  const handlePhotoSelect = (member: any) => {
    setUploadForMember(member);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    try {
      if (!croppedAreaPixels || !cropImage || !uploadForMember?.id) return;
      
      const croppedImage = await getCroppedImg(cropImage, croppedAreaPixels);

      const updatePayload = {
        rows: [{
          id: uploadForMember.id,
          data: { photo: croppedImage }
        }]
      };

      const response = await updateDataset(updatePayload);
      
      if (response.success) {
        alert("Photo uploaded successfully!");
        
        setLocalMembers(prev => 
          prev.map(member => {
            if (member.id === uploadForMember.id) {
              return { ...member, photo: croppedImage };
            }
            return member;
          })
        );
        
        setUploadForMember(null);
        setShowCropModal(false);
        setCropImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert("Failed to upload photo. Please try again.");
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Error cropping image. Please try again.");
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImage(null);
    setUploadForMember(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([46, 8, 9, 27, 13, 110, 35, 36, 37, 38, 39, 40].includes(e.keyCode) ||
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true)) {
      return;
    }
    
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const hasChanges = Object.keys(editedMembers).length > 0;
  const selectedPersonData = familyMembers.find(
    (member) => member.id === selectedPerson.id || member.vname === selectedPerson.vname
  ) || selectedPerson;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
        <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                नाम - {selectedPersonData?.vname || selectedPerson?.vname}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-700" />
              </button>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Family ID:</span>
              <span className="text-sm text-gray-900 ml-2 font-semibold">
                {selectedPerson.family_id || "00000-XXXXX-00000"}
              </span>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 120px)" }}>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-16">Sr.</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-48">Name (Gender-Age)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-36">Father</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-36">Mother</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-28">DOB</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-28">D. verify</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-32">Phone 1</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-32">Phone 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 w-24">Photo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {familyMembers.map((member, index) => {
                    const memberId = member.id || member.family_id;
                    const gender = getGenderDisplay(member.sex);
                    const age = member.age || "-";
                    
                    return (
                      <tr key={member.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 text-center">{index + 1}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-900">
                          <div className="flex justify-between items-center">
                            <span>{member.vname || "-"}</span>
                            <span className="text-xs text-gray-500 ml-2">({gender}-{age})</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 truncate">{member.fname || "-"}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 truncate">{member.mname || "-"}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 p-0">
                          <input
                            type="date"
                            value={getDOBValue(member)}
                            onChange={(e) => handleDOBChange(memberId, e.target.value)}
                            className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 text-center">
                          <input 
                            type="checkbox" 
                            checked={getVerifyValue(member)}
                            onChange={(e) => handleVerifyChange(memberId, e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 p-0">
                          <input
                            type="text"
                            value={getPhoneValue(member, 'phone1')}
                            onChange={(e) => handlePhoneChange(memberId, 'phone1', e.target.value)}
                            onKeyDown={handlePhoneKeyDown}
                            className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            placeholder="Phone 1"
                            pattern="[0-9]*"
                            inputMode="numeric"
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900 p-0">
                          <input
                            type="text"
                            value={getPhoneValue(member, 'phone2')}
                            onChange={(e) => handlePhoneChange(memberId, 'phone2', e.target.value)}
                            onKeyDown={handlePhoneKeyDown}
                            className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            placeholder="Phone 2"
                            pattern="[0-9]*"
                            inputMode="numeric"
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm text-gray-900">
                          {member.photo ? (
                            <div className="relative group">
                              <img 
                                src={member.photo} 
                                alt={member.vname} 
                                className="w-10 h-10 rounded-md object-cover cursor-pointer"
                                onClick={() => window.open(member.photo, '_blank')}
                              />
                              <button
                                onClick={() => handlePhotoSelect(member)}
                                className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePhotoSelect(member)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                            >
                              Upload
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
            {hasChanges && (
              <div className="text-sm text-blue-600">{Object.keys(editedMembers).length} member(s) edited</div>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleSubmit}
                disabled={!hasChanges}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  hasChanges ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Photo</h3>
            <div className="relative w-full h-96 bg-gray-900 rounded-lg">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};