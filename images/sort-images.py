from os import listdir, makedirs
from os.path import isfile, join
import shutil

frame_dir = 'images/frames'
images = [join(frame_dir, f) for f in listdir(frame_dir)]
images = [f for f in sorted(images) if isfile(f)]
out_dir = join(frame_dir, 'out')

shutil.rmtree(out_dir, ignore_errors=True)
makedirs(out_dir)

for i, src in enumerate(images):
    dst_name = 'frame_{:03d}.png'.format(i)
    dst = join(out_dir, dst_name)
    print(dst)
    shutil.copyfile(src, dst)
    