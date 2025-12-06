import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';

const  PomodoroScreen = () => {
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimer(isWorkPhase ? 25 * 60 : 5 * 60);
  }, [isWorkPhase]);

  useEffect(() => {
    let interval = null;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsWorkPhase(!isWorkPhase);
      setTimer(isWorkPhase ? 5 * 60 : 25 * 60);
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timer, isWorkPhase]);

  const progress = (isWorkPhase ? 25 * 60 - timer : 5 * 60 - timer) / (isWorkPhase ? 25 * 60 : 5 * 60);

  return (
    <View style={styles.container}>
      <Text style={styles.phase}>{isWorkPhase ? 'Work' : 'Break'}</Text>
      <Progress.Circle
        size={200}
        progress={progress}
        showsText
        formatText={() => formatTime(timer)}
        textStyle={styles.timerText}
        color={isWorkPhase ? '#3F51B5' : '#4caf50'}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#3F51B5'}]} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#3F51B5'}]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  phase: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#3F51B5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PomodoroScreen;