FROM nginx:alpine

# ตั้งค่า Timezone เป็น Asia/Bangkok
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone

# ลบไฟล์ default ของ nginx ทิ้งไปก่อน
RUN rm -rf /usr/share/nginx/html/*

# -------------------------------------------------------
# จุดสำคัญ: Copy โฟลเดอร์ dist จากเครื่องเรา เข้าไปใน Container โดยตรง
# -------------------------------------------------------
# สมมติว่าไฟล์ Dockerfile วางอยู่ระดับเดียวกับโฟลเดอร์ dist
COPY build /usr/share/nginx/html

# Copy ไฟล์ตั้งค่า Nginx (เพื่อให้รองรับ Vue Router ได้ถูกต้อง)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# เปิด Port 80
EXPOSE 80

# สั่งรัน Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]

