import avatar_nurse_1 from '../../assets/slc-ai-nurse-1.png'
import avatar_nurse_2 from '../../assets/slc-ai-nurse-2.png'
import avatar_nurse_3 from '../../assets/slc-ai-nurse-3.png'
import avatar_nurse_4 from '../../assets/slc-ai-nurse-4.png'
import avatar_nurse_5 from '../../assets/slc-ai-nurse-5.png'
import avatar_nurse_6 from '../../assets/slc-ai-nurse-6.png'
import avatar_nurse_7 from '../../assets/slc-ai-nurse-7.png'
import avatar_nurse_8 from '../../assets/slc-ai-nurse-8.png'
import avatar_nurse_9 from '../../assets/slc-ai-nurse-9.png'
import avatar_nurse_10 from '../../assets/slc-ai-nurse-10.png'

import avatar_resident_1 from '../../assets/slc-ai-resident-1.png'
import avatar_resident_2 from '../../assets/slc-ai-resident-2.png'
import avatar_resident_3 from '../../assets/slc-ai-resident-3.png'
import avatar_resident_4 from '../../assets/slc-ai-resident-4.png'
import avatar_resident_5 from '../../assets/slc-ai-resident-5.png'
import avatar_resident_6 from '../../assets/slc-ai-resident-6.png'
import avatar_resident_7 from '../../assets/slc-ai-resident-7.png'
import avatar_resident_8 from '../../assets/slc-ai-resident-8.png'
import avatar_resident_9 from '../../assets/slc-ai-resident-9.png'
import avatar_resident_10 from '../../assets/slc-ai-resident-10.png'
import avatar_resident_11 from '../../assets/slc-ai-resident-11.png'
import avatar_resident_12 from '../../assets/slc-ai-resident-12.png'

import avatar_tutor_1 from '../../assets/slc-ai-tutor-1.png'
import avatar_tutor_2 from '../../assets/slc-ai-tutor-2.png'

import robot_1 from '../../assets/robot_1.png'

export interface UserAvatar {
    id: string;
    src: string;
    label: string;
}

export const AVATAR_LIST: UserAvatar[] = [
    {id:"1", src: avatar_nurse_1 as string, label: 'Carer 1'},
    {id:"2", src: avatar_nurse_2 as string, label: 'Carer 2'},
    {id:"3", src: avatar_nurse_3 as string, label: 'Carer 3'},
    {id:"4", src: avatar_nurse_4 as string, label: 'Carer 4'},
    {id:"5", src: avatar_nurse_5 as string, label: 'Carer 5'},
    {id:"6", src: avatar_nurse_6 as string, label: 'Carer 6'},
    {id:"7", src: avatar_nurse_7 as string, label: 'Carer 7'},
    {id:"8", src: avatar_nurse_8 as string, label: 'Carer 8'},
    {id:"9", src: avatar_resident_1 as string, label: 'Resident 1'},
    {id:"10", src: avatar_resident_2 as string, label: 'Resident 2'},
    {id:"11", src: avatar_resident_3 as string, label: 'Resident 3'},
    {id:"12", src: avatar_resident_4 as string, label: 'Resident 4'},
    {id:"13", src: avatar_resident_5 as string, label: 'Resident 5'},
    {id:"14", src: avatar_resident_6 as string, label: 'Resident 6'},
    {id:"15", src: avatar_tutor_1 as string, label: 'Tutor 1'},
    {id:"16", src: avatar_tutor_2 as string, label: 'Tutor 2'},
    {id:"17", src: avatar_nurse_9 as string, label: 'Carer 9'},
    {id:"18", src: avatar_nurse_10 as string, label: 'Carer 10'},
    {id:"19", src: robot_1 as string, label: 'Robot 1'},
    {id:"20", src: avatar_resident_7 as string, label: 'Resident 7'},
    {id:"21", src: avatar_resident_8 as string, label: 'Resident 8'},
    {id:"22", src: avatar_resident_9 as string, label: 'Resident 9'},
    {id:"23", src: avatar_resident_10 as string, label: 'Resident 10'},
    {id:"24", src: avatar_resident_11 as string, label: 'Resident 11'},
    {id:"25", src: avatar_resident_12 as string, label: 'Resident 12'},
];

export const getAvatarById = (id: string): UserAvatar | undefined => {
    return AVATAR_LIST.find(avatar => avatar.id === id);
}
