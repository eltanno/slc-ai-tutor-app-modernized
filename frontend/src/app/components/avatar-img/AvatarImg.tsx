import {getAvatarById} from "../../utils/getAvatarById.ts";

const AvatarImg = ({ avatarId, size, direction }: { avatarId: string; size?: number; direction?: string }) => {
    const avatar = getAvatarById(avatarId);
    const src = avatar ? avatar.src : '';
    const alt = avatar ? avatar.label : 'Avatar';

    size = size || 100;
    direction = direction || 'left';
    return (
        <img
            src={src}
            alt={alt}
            style={{
                width: size,
                height: size,
                objectFit: 'cover',
                transform: direction === 'right' ? "rotateY(180deg)" : "none",
            }}
        />
    );
};

export default AvatarImg;
