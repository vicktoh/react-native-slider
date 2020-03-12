import React, { Component } from 'react';
import { View,
     Animated, 
     PanResponder,
      Dimensions,
    UIManager,
    LayoutAnimation } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPEOUT_DURATION = 250;
class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => { },
        onSwipeLeft: () => { }
    }
    constructor(props) {
        super(props);
        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {

                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    console.log('card liked');
                    this.forceSwipe('right');
                } else if (gesture.dx < - SWIPE_THRESHOLD) {
                    console.log('card Disliked');
                    this.forceSwipe('left');
                } else {
                    this.resetPosition();
                }

            }
        });
        this.state = { panResponder, position, index: 0 };
    }
    
    componentWillReceiveProps(nextProps) {
        if(nextProps.data !== this.props.data){
            this.setState({index:0});
        }
    }
    componentWillUpdate (nextProps, nextState){
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
      
    };
    
    
    forceSwipe(direction) {
        const x = direction == 'right' ? SCREEN_WIDTH + 10 : - (SCREEN_WIDTH + 10);
        Animated.timing(this.state.position, {
            toValue: { x: x, y: 0 },
            duration: SWIPEOUT_DURATION
        }).start(() => { this.onSwipeComplete(direction) });
    }
    onSwipeComplete(direction) {
        const { onSwipeRight, onSwipeLeft, data } = this.props;
        const item = data[this.state.index];
        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.setState({ index: (this.state.index + 1) });
        this.state.position.setValue({ x: 0, y: 0 });
    }


    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0 }
        }).start();
    }
    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        })
        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        }

    }
    renderCards() {
        return this.props.data.map((item, index) => {
            console.log(this.state.index);
            if (index < this.state.index) {
                return null;
            }
            if (index === this.state.index) {
                return (
                    <Animated.View key={item.id} style={[this.getCardStyle(), styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>

                );
            }
            return (
                <Animated.View key = {item.id}
                 style = {[{zIndex: index * -1, top: 10*(index - this.state.index)},styles.cardStyle]}>
                    {this.props.renderCard(item)} 
                </Animated.View>
            );
        }).reverse();
    }
    render() {
        return (
            <View >
                {this.renderCards()}
            </View>
        );
    }

}

const styles = {
    cardStyle: {
        position: 'absolute',
        left: 0,
        right: 0
    }
}

export default Deck;