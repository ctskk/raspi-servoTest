CPP = g++
INCLUDE = -I./
LIBS = -lwiringPi
CPPFLAGS = -O3 $(INCLUDE) $(LIBS)
TARGET = servo

OBJS = servo.o

$(TARGET) : $(OBJS)
	g++ $(OBJS) $(CPPFLAGS) -o $@

clean :
	rm -f *.o $(TARGET)

